import { Service } from "typedi";
import { IService } from ".";
import { ConfigurationService } from "./config";
import { DatabaseService } from "./database";
import { HttpService } from "./http";
import { LoggerService } from "./log";

/**
 * The tilt service in a nutshell. Contains all services required to run tilt.
 */
@Service()
export class Tilt implements IService {
  private readonly _services: IService[];

  public constructor(
    config: ConfigurationService,
    logger: LoggerService,
    database: DatabaseService,
    http: HttpService,
  ) {
    this._services = [
      config,
      logger,
      database,
      http,
    ];
  }

  /**
   * Starts all tilt related services.
   */
  public async bootstrap(): Promise<void> {
    for (const service of this._services) {
      try {
        await service.bootstrap();
      } catch (error) {
        // tslint:disable-next-line: no-console
        console.error(`unable to load service: ${error}\n${error.stack}`);
        process.exit(1);
      }
    }
  }
}
