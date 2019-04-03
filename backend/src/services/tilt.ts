import { Service } from "typedi";
import { IService } from ".";
import { ConfigurationService } from "./config";
import { HttpService } from "./http";

/**
 * The tilt service in a nutshell. Contains all services required to run tilt.
 */
@Service()
export class Tilt implements IService {
  private readonly _services: IService[];

  public constructor(
    config: ConfigurationService,
    http: HttpService,
  ) {
    this._services = [
      config,
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
