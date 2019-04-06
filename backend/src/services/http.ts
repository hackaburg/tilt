import * as express from "express";
import { join } from "path";
import { Action, useContainer, useExpressServer } from "routing-controllers";
import { Container, Inject, Service, Token } from "typedi";
import { IService } from ".";
import { User } from "../entities/user";
import { ConfigurationServiceToken, IConfigurationService } from "./config";
import { ILoggerService, LoggerServiceToken } from "./log";
import { IUserService, UserServiceToken } from "./user";

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
  ) { }

  /**
   * Starts the HTTP service.
   */
  public async bootstrap(): Promise<void> {
    useContainer(Container);

    const server = express();
    const routedServer = useExpressServer(server, {
      controllers: [
        join(__dirname, "../controllers/*"),
      ],
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

    return new Promise<void>((resolve, reject) => {
      const port = this._config.config.http.port;

      routedServer.listen(port, (error: Error) => {
        if (error) {
          reject(error);
        }

        this._logger.info(`http server running on ${port}`);
        resolve();
      });
    });
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
}
