import { Service, Token } from "typedi";
import * as WebSocket from "ws";
import { IService } from ".";
import { UserRole } from "../../../types/roles";
import { IWebSocketMessage, IWebSocketMessageData } from "../../../types/ws";

/**
 * A service to interface with websockets.
 */
export interface IWebSocketService extends IService {
  /**
   * Registers a client in the websocket service, to allow broadcasting.
   * @param role The client's role
   * @param socket A websocket from the client
   */
  registerClient(role: UserRole, socket: WebSocket): void;

  /**
   * Sends the given message to all clients from the given audience.
   * @param audience Users with the given or a higher role
   * @param data Data to send the audience
   */
  broadcast(audience: UserRole, message: IWebSocketMessageData): void;
}

/**
 * A token used to inject a concrete @see IWebSocketService.
 */
export const WebSocketServiceToken = new Token<IWebSocketService>();

interface IClient {
  socket: WebSocket;
  role: UserRole;
}

@Service(WebSocketServiceToken)
export class WebSocketService implements IWebSocketService {
  private readonly _clients: IClient[] = [];

  /**
   * Bootstraps the websocket service, i.e. noop.
   */
  public async bootstrap(): Promise<void> {
    return;
  }

  /**
   * Removes a socket from the socket array, e.g. on disconnect.
   * @param socket The socket to remove
   */
  private unregisterClient(socket: WebSocket): void {
    const index = this._clients.findIndex((client) => client.socket === socket);

    if (index !== -1) {
      this._clients.splice(index, 1);
    }
  }

  /**
   * Registers a client in the server.
   * @param role The client's role
   * @param socket A websocket to the client
   */
  public registerClient(role: UserRole, socket: WebSocket): void {
    this._clients.push({
      role,
      socket,
    });

    socket.on("close", () => {
      this.unregisterClient(socket);
    });
  }

  /**
   * Expands the audience that will receive a message, e.g. expands @see UserRole.Moderator to both moderators and owners.
   * @param audience The current audience to expand
   */
  private expandAudience(audience: UserRole): UserRole[] {
    switch (audience) {
      case UserRole.User:
        return [UserRole.User, UserRole.Moderator, UserRole.Owner];

      case UserRole.Moderator:
        return [UserRole.Moderator, UserRole.Owner];

      case UserRole.Owner:
        return [UserRole.Owner];

      default:
        return [];
    }
  }

  /**
   * Broadcasts the given message to the audience.
   * @param audience Users with the given or a higher role
   * @param data The data to send
   */
  public broadcast(audience: UserRole, data: IWebSocketMessageData): void {
    const expandedAudience = this.expandAudience(audience);
    const clientsWithRole = this._clients.filter((client) =>
      expandedAudience.includes(client.role),
    );
    const message: IWebSocketMessage = {
      data,
      status: "ok",
    };

    const json = JSON.stringify(message);

    for (const client of clientsWithRole) {
      client.socket.send(json);
    }
  }
}
