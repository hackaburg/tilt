import { Inject, Service } from "typedi";
import { IService } from ".";
import { ActivityServiceToken, IActivityService } from "./activity";
import { ConfigurationServiceToken, IConfigurationService } from "./config";
import { DatabaseServiceToken, IDatabaseService } from "./database";
import { EmailServiceToken, IEmailService } from "./email";
import { EmailTemplateServiceToken, IEmailTemplateService } from "./email-template";
import { HaveibeenpwnedServiceToken, IHaveibeenpwnedService } from "./haveibeenpwned";
import { HttpServiceToken, IHttpService } from "./http";
import { ILoggerService, LoggerServiceToken } from "./log";
import { ISettingsService, SettingsServiceToken } from "./settings";
import { ISlackNotificationService, SlackNotificationServiceToken } from "./slack";
import { ITokenService, TokenServiceToken } from "./tokens";
import { IUserService, UserServiceToken } from "./user";
import { IWebSocketService, WebSocketServiceToken } from "./ws";

/**
 * The tilt service in a nutshell. Contains all services required to run tilt.
 */
@Service()
export class Tilt implements IService {
  private readonly _services: IService[];

  public constructor(
    @Inject(HaveibeenpwnedServiceToken) haveibeenpwned: IHaveibeenpwnedService,
    @Inject(ConfigurationServiceToken) config: IConfigurationService,
    @Inject(LoggerServiceToken) logger: ILoggerService,
    @Inject(SlackNotificationServiceToken) slack: ISlackNotificationService,
    @Inject(DatabaseServiceToken) database: IDatabaseService,
    @Inject(EmailServiceToken) email: IEmailService,
    @Inject(EmailTemplateServiceToken) emailTemplates: IEmailTemplateService,
    @Inject(ActivityServiceToken) activity: IActivityService,
    @Inject(TokenServiceToken) tokens: ITokenService<any>,
    @Inject(UserServiceToken) users: IUserService,
    @Inject(SettingsServiceToken) settings: ISettingsService,
    @Inject(WebSocketServiceToken) ws: IWebSocketService,
    @Inject(HttpServiceToken) http: IHttpService,
  ) {
    this._services = [
      haveibeenpwned,
      config,
      logger,
      slack,
      database,
      email,
      emailTemplates,
      activity,
      tokens,
      users,
      settings,
      ws,
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
