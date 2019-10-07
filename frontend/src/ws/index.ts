import {
  IWebSocketMessage,
  IWebSocketMessageData,
  WebSocketMessageType,
} from "../../../types/ws";
import { getLoginToken } from "../authentication";

/**
 * A message handler for websocket data.
 */
export interface IWebSocketMessageHandler {
  /**
   * The type this handler takes care of.
   */
  type: WebSocketMessageType;

  /**
   * A callback called when there's data from the websocket.
   * @param data The data received from the websocket
   */
  onMessage(data: IWebSocketMessageData): void;
}

export class WebSocketHandler {
  private readonly _messageHandlers: IWebSocketMessageHandler[];
  private readonly _url: string;
  private readonly _ws: WebSocket;

  constructor(apiBaseUrl: string) {
    const httpRegex = /^http/;
    const ssl = location.protocol === "https";
    const wsBaseUrl = httpRegex.test(apiBaseUrl)
      ? apiBaseUrl.replace(/^http/, "ws")
      : `${ssl ? "wss" : "ws"}://${location.host}${apiBaseUrl}`;

    this._url = `${wsBaseUrl}/ws`;
    this._ws = new WebSocket(this._url);
    this._messageHandlers = [];

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
        if (handler.type === message.data.type) {
          handler.onMessage(message.data);
          return;
        }
      }

      // tslint:disable-next-line: no-console
      console.info(
        `couldn't handle message of type ${message.data.type}`,
        message,
      );
    });

    this._ws.addEventListener("open", () => {
      this.send({
        token: getLoginToken(),
        type: WebSocketMessageType.Token,
      });
    });
  }

  /**
   * Registers a message handler in this handler.
   * @param handler The handler to register
   */
  public registerMessageHandler(handler: IWebSocketMessageHandler): void {
    this._messageHandlers.push(handler);
  }

  /**
   * Sends the given data to the server.
   * @param data The data to send to the server
   */
  public send(data: IWebSocketMessageData): void {
    if (this._ws.readyState !== WebSocket.OPEN) {
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
