import { Inject, Service } from "typedi";
import { IService } from ".";
import { ActivityServiceToken, IActivityService } from "./activity";
import { ConfigurationServiceToken, IConfigurationService } from "./config";
import { DatabaseServiceToken, IDatabaseService } from "./database";
import { HttpServiceToken, IHttpService } from "./http";
import { ILoggerService, LoggerServiceToken } from "./log";
import { IUserService, UserServiceToken } from "./user";

/**
 * The tilt service in a nutshell. Contains all services required to run tilt.
 */
@Service()
export class Tilt implements IService {
  private readonly _services: IService[];

  public constructor(
    @Inject(ConfigurationServiceToken) config: IConfigurationService,
    @Inject(LoggerServiceToken) logger: ILoggerService,
    @Inject(DatabaseServiceToken) database: IDatabaseService,
    @Inject(ActivityServiceToken) activity: IActivityService,
    @Inject(UserServiceToken) users: IUserService,
    @Inject(HttpServiceToken) http: IHttpService,
  ) {
    this._services = [
      config,
      logger,
      database,
      activity,
      users,
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
