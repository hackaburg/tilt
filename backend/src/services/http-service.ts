import * as cors from "cors";
import * as express from "express";
import * as ws from "express-ws";
import { createServer } from "http";
import { join } from "path";
import { Action, useContainer, useExpressServer } from "routing-controllers";
import { Container, Inject, Service, Token } from "typedi";
import * as WebSocket from "ws";
import { IService } from ".";
import { UserRole } from "../../../types/roles";
import { IWebSocketMessage, WebSocketMessageType } from "../../../types/ws";
import { User } from "../entities/user";
import { ConfigurationServiceToken, IConfigurationService } from "./config-service";
import { ILoggerService, LoggerServiceToken } from "./logger-service";
import { IUserService, UserServiceToken } from "./user-service";
import { IWebSocketService, WebSocketServiceToken } from "./ws-service";

/**
 * An interface describing the http service.
 */
// tslint:disable-next-line: no-empty-interface
export interface IHttpService extends IService {
  /**
   * Gets the current user from the incoming request.
   * @param action The currently performed action
   */
  getCurrentUser(action: Action): Promise<User | undefined>;

  /**
   * Checks whether the user from the incoming request is allowed to perform an action
   * @param action The currently performed action
   * @param roles The roles required for the action
   */
  isActionAuthorized(action: Action, roles?: UserRole[]): Promise<boolean>;

  /**
   * Sets up the incoming websocket.
   * @param socket The incoming websocket
   */
  setupWebSocketConnection(socket: WebSocket): void;
}

/**
 * A token used to inject a concrete http service.
 */
export const HttpServiceToken = new Token<IHttpService>();

/**
 * A concrete http service.
 */
@Service(HttpServiceToken)
export class HttpService implements IHttpService {
  public constructor(
    @Inject(ConfigurationServiceToken) private readonly _config: IConfigurationService,
    @Inject(LoggerServiceToken) private readonly _logger: ILoggerService,
    @Inject(UserServiceToken) private readonly _users: IUserService,
    @Inject(WebSocketServiceToken) private readonly _ws: IWebSocketService,
  ) { }

  /**
   * Starts the HTTP service.
   */
  public async bootstrap(): Promise<void> {
    useContainer(Container);

    const app = express();

    if (!this._config.isProductionEnabled) {
      app.use(cors());
      this._logger.debug("enabled cors");
    }

    const routedApp = useExpressServer(app, {
      authorizationChecker: async (action, roles?: UserRole[]) => await this.isActionAuthorized(action, roles),
      controllers: [
        join(__dirname, "../controllers/*"),
      ],
      cors: !this._config.isProductionEnabled,
      currentUserChecker: async (action) => await this.getCurrentUser(action),
      defaultErrorHandler: false,
      defaults: {
        paramOptions: {
          required: true,
        },
      },
      development: !this._config.isProductionEnabled,
      interceptors: [
        join(__dirname, "../interceptors/*"),
      ],
      middlewares: [
        join(__dirname, "../middlewares/*"),
      ],
      routePrefix: "/api",
    });

    this._logger.debug("initialized http controllers");
    const server = createServer(routedApp);

    const wsApp = ws(routedApp, server).app;
    wsApp.ws("/api/ws", (socket) => this.setupWebSocketConnection(socket));
    this._logger.debug("initialized ws");

    const port = this._config.config.http.port;
    server.listen(port);
    this._logger.info(`http server running on ${port}`);
  }

  /**
   * Gets the current user from the incoming request.
   * @param action The currently performed action
   */
  public async getCurrentUser(action: Action): Promise<User | undefined> {
    const token: string | undefined = action.request.headers.authorization;
    const prefix = "bearer ";

    if (!token) {
      return;
    }

    if (!token.toLowerCase().startsWith(prefix)) {
      return;
    }

    const tokenWithoutPrefix = token.substring(prefix.length);

    try {
      return await this._users.findUserByLoginToken(tokenWithoutPrefix);
    } catch (error) {
      return;
    }
  }

  /**
   * Checks whether the given role can perform an action with an expected role.
   * @param expectedRole The role required to perform the action
   * @param actualRole The actual role
   */
  private isActionAllowed(expectedRole: UserRole, actualRole: UserRole): boolean {
    switch (actualRole) {
      case UserRole.User:
        switch (expectedRole) {
          case UserRole.User:
            return true;
          default:
            return false;
        }

      case UserRole.Moderator:
        switch (expectedRole) {
          case UserRole.User:
          case UserRole.Moderator:
            return true;
          default:
            return false;
        }

      case UserRole.Owner:
        return true;

      default:
        return false;
    }
  }

  /**
   * Checks whether the user from the incoming request is allowed to perform an action
   * @param action The currently performed action
   * @param roles The roles required for the action
   */
  public async isActionAuthorized(action: Action, roles?: UserRole[]): Promise<boolean> {
    if (!roles || !roles.length) {
      return false;
    }

    const user = await this.getCurrentUser(action);

    if (!user) {
      return false;
    }

    for (const role of roles) {
      if (!this.isActionAllowed(role, user.role)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Sets up the incoming websocket and registeres it in the injected websocket service after authentication.
   * @param socket The incoming websocket
   */
  public setupWebSocketConnection(socket: WebSocket): void {
    const onMessage = async (messageString?: string) => {
      if (!messageString) {
        return;
      }

      let message: IWebSocketMessage;

      try {
        message = JSON.parse(messageString);
      } catch {
        return;
      }

      if (!message || !message.data) {
        return;
      }

      const { data } = message;

      if (data.type === WebSocketMessageType.Token) {
        const user = await this._users.findUserByLoginToken(data.token);

        if (!user) {
          this._logger.debug("unauthorized websocket access");
          socket.close();
          return;
        }

        socket.off("message", onMessage);
        this._ws.registerClient(user.role, socket);
      }
    };

    socket.on("message", onMessage);
  }
}
