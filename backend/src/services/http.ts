import * as express from "express";
import { join } from "path";
import { useContainer, useExpressServer } from "routing-controllers";
import { Container, Inject, Service, Token } from "typedi";
import { IService } from ".";
import { ConfigurationServiceToken, IConfigurationService } from "./config";
import { ILoggerService, LoggerServiceToken } from "./log";

/**
 * An interface describing the http service.
 */
// tslint:disable-next-line: no-empty-interface
export interface IHttpService extends IService { }

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
      defaultErrorHandler: false,
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
}
