import {
  IWebSocketMessage,
  IWebSocketMessageData,
  WebSocketMessageType,
} from "../../../types/ws";
import { getLoginToken } from "../authentication";
import {
  websocketReconnectDelayMilliseconds,
  websocketReconnectMaxAttempts,
} from "../config";

/**
 * A callback called when there's data from the websocket.
 * @param data The data received from the websocket
 */
export type WebSocketMessageHandler = (data: IWebSocketMessageData) => void;

export class WebSocketHandler {
  private readonly _url: string;
  private _ws!: WebSocket;
  private _messageHandlers: WebSocketMessageHandler[];
  private _reconnectCount: number;

  constructor(apiBaseUrl: string) {
    const httpRegex = /^http/;
    const ssl = location.protocol === "https";
    const wsBaseUrl = httpRegex.test(apiBaseUrl)
      ? apiBaseUrl.replace(/^http/, "ws")
      : `${ssl ? "wss" : "ws"}://${location.host}${apiBaseUrl}`;

    this._url = `${wsBaseUrl}/ws`;
    this._messageHandlers = [];
    this._reconnectCount = 0;

    this.connect();
  }

  public get isConnected(): boolean {
    return this._ws.readyState === WebSocket.OPEN;
  }

  /**
   * Creates and connects the socket.
   */
  private connect(): void {
    this._ws = new WebSocket(this._url);

    this._ws.addEventListener("message", ({ data }) => {
      let message: IWebSocketMessage;

      try {
        message = JSON.parse(data);
      } catch {
        return;
      }

      if (!message || !message.data) {
        return;
      }

      for (const handler of this._messageHandlers) {
        handler(message.data);
      }

      // tslint:disable-next-line: no-console
      console.info(
        `couldn't handle message of type ${message.data.type}`,
        message,
      );
    });

    this._ws.addEventListener("open", () => {
      this._reconnectCount = 0;
      this.send({
        token: getLoginToken(),
        type: WebSocketMessageType.Token,
      });
    });

    this._ws.addEventListener("close", () => {
      this._reconnectCount++;

      if (this._reconnectCount <= websocketReconnectMaxAttempts) {
        // increase reconnect delay after every attempt to give the backend time to
        // recover if it crashed. this will connect the socket after e.g. 5s, then 10s
        const reconnectDelay =
          websocketReconnectDelayMilliseconds * this._reconnectCount;

        setTimeout(() => {
          if (this.isConnected) {
            // ws already connected, we don't need to reconnect
            return;
          }

          this.connect();
        }, reconnectDelay);
      }
    });
  }

  /**
   * Registers a message handler in this handler.
   * @param handler The handler to register
   */
  public registerMessageHandler(handler: WebSocketMessageHandler): void {
    this._messageHandlers.push(handler);
  }

  /**
   * Unregisters a message handler in this handler.
   * @param handler The handler to unregister
   */
  public unregisterMessageHandler(
    handlerToDelete: WebSocketMessageHandler,
  ): void {
    this._messageHandlers = this._messageHandlers.filter(
      (handler) => handler !== handlerToDelete,
    );
  }

  /**
   * Sends the given data to the server.
   * @param data The data to send to the server
   */
  public send(data: IWebSocketMessageData): void {
    if (!this.isConnected) {
      return;
    }

    const message: IWebSocketMessage = {
      data,
      status: "ok",
    };

    const json = JSON.stringify(message);
    this._ws.send(json);
  }

  /**
   * Closes the websocket.
   */
  public close(): void {
    this._ws.close();
  }
}
