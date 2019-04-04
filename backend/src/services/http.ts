import * as express from "express";
import { join } from "path";
import { useContainer, useExpressServer } from "routing-controllers";
import { Container, Service } from "typedi";
import { IService } from ".";
import { ConfigurationService } from "./config";
import { LoggerService } from "./log";

@Service()
export class HttpService implements IService {
  public constructor(
    private readonly _config: ConfigurationService,
    private readonly _logger: LoggerService,
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
