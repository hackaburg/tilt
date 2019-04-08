import { Inject, Service } from "typedi";
import { IService } from ".";
import { ActivityServiceToken, IActivityService } from "./activity";
import { ConfigurationServiceToken, IConfigurationService } from "./config";
import { DatabaseServiceToken, IDatabaseService } from "./database";
import { EmailServiceToken, IEmailService } from "./email";
import { HttpServiceToken, IHttpService } from "./http";
import { ILoggerService, LoggerServiceToken } from "./log";
import { ISettingsService, SettingsServiceToken } from "./settings";
import { ITokenService, TokenServiceToken } from "./tokens";
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
    @Inject(EmailServiceToken) email: IEmailService,
    @Inject(ActivityServiceToken) activity: IActivityService,
    @Inject(TokenServiceToken) tokens: ITokenService<any>,
    @Inject(UserServiceToken) users: IUserService,
    @Inject(SettingsServiceToken) settings: ISettingsService,
    @Inject(HttpServiceToken) http: IHttpService,
  ) {
    this._services = [
      config,
      logger,
      database,
      email,
      activity,
      tokens,
      users,
      settings,
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
