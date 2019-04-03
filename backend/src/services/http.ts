import * as express from "express";
import { join } from "path";
import { useContainer, useExpressServer } from "routing-controllers";
import { Container, Service } from "typedi";
import { IService } from ".";
import { ConfigurationService } from "./config";

@Service()
export class HttpService implements IService {
  public constructor(
    private readonly _config: ConfigurationService,
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
      routePrefix: "/api",
    });

    return new Promise<void>((resolve, reject) => {
      console.log(this._config.config.http.port);
      routedServer.listen(this._config.config.http.port, (error: Error) => {
        if (error) {
          reject(error);
        }

        resolve();
      });
    });
  }
}
