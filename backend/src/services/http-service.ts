import * as cors from "cors";
import * as express from "express";
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { Action, useContainer, useExpressServer } from "routing-controllers";
import { Container, Inject, Service, Token } from "typedi";
import { IService } from ".";
import { User } from "../entities/user";
import { UserRole } from "../entities/user-role";
import {
  ConfigurationServiceToken,
  IConfigurationService,
} from "./config-service";
import { ILoggerService, LoggerServiceToken } from "./logger-service";
import { IUserService, UserServiceToken } from "./user-service";

/**
 * The text that's prepended to all API routes.
 */
export const apiRoutePrefix = "/api";

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
    @Inject(ConfigurationServiceToken)
    private readonly _config: IConfigurationService,
    @Inject(LoggerServiceToken) private readonly _logger: ILoggerService,
    @Inject(UserServiceToken) private readonly _users: IUserService,
  ) {}

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

    useExpressServer(app, {
      authorizationChecker: async (action, roles?: UserRole[]) =>
        await this.isActionAuthorized(action, roles),
      controllers: [join(__dirname, "../controllers/*")],
      cors: !this._config.isProductionEnabled,
      currentUserChecker: async (action) => await this.getCurrentUser(action),
      defaultErrorHandler: false,
      defaults: {
        paramOptions: {
          required: true,
        },
      },
      development: !this._config.isProductionEnabled,
      interceptors: [join(__dirname, "../interceptors/*")],
      middlewares: [join(__dirname, "../middlewares/*")],
      routePrefix: apiRoutePrefix,
    });

    this._logger.debug("initialized http controllers");

    const publicDirectory = this._config.config.http.publicDirectory;
    app.use(
      express.static(publicDirectory, {
        immutable: true,
        maxAge: "1y",
        setHeaders: (res, path) => {
          if (path.endsWith("index.html")) {
            // disable caching of index.html
            res.setHeader("Cache-Control", "public, max-age=0");
          }
        },
      }),
    );

    const indexFilePath = join(publicDirectory, "index.html");
    const indexFileContents = existsSync(indexFilePath)
      ? readFileSync(indexFilePath)
      : "";

    app.get("*", (request, response) => {
      if (request.url.startsWith(apiRoutePrefix)) {
        return;
      }

      response.write(indexFileContents);
      response.end();
    });

    this._logger.debug(`initialized static serving from ${publicDirectory}`);

    const port = this._config.config.http.port;
    app.listen(port);
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
  private isActionAllowed(
    expectedRole: UserRole,
    actualRole: UserRole,
  ): boolean {
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

      case UserRole.Root:
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
  public async isActionAuthorized(
    action: Action,
    roles?: UserRole[],
  ): Promise<boolean> {
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
}
