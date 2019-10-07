import { Inject, Service } from "typedi";
import { IService } from ".";
import { ActivityServiceToken, IActivityService } from "./activity-service";
import {
  BootShutdownNotificationServiceToken,
  IBootShutdownNotificationService,
} from "./boot-shutdown-notification-service";
import {
  ConfigurationServiceToken,
  IConfigurationService,
} from "./config-service";
import { DatabaseServiceToken, IDatabaseService } from "./database-service";
import { EmailServiceToken, IEmailService } from "./email-service";
import {
  EmailTemplateServiceToken,
  IEmailTemplateService,
} from "./email-template-service";
import {
  HaveibeenpwnedServiceToken,
  IHaveibeenpwnedService,
} from "./haveibeenpwned-service";
import { HttpServiceToken, IHttpService } from "./http-service";
import { ILoggerService, LoggerServiceToken } from "./logger-service";
import { ISettingsService, SettingsServiceToken } from "./settings-service";
import {
  ISlackNotificationService,
  SlackNotificationServiceToken,
} from "./slack-service";
import { ITokenService, TokenServiceToken } from "./token-service";
import {
  IUnixSignalService,
  UnixSignalServiceToken,
} from "./unix-signal-service";
import { IUserService, UserServiceToken } from "./user-service";
import { IWebSocketService, WebSocketServiceToken } from "./ws-service";

/**
 * The tilt service in a nutshell. Contains all services required to run tilt.
 */
@Service()
export class Tilt implements IService {
  private readonly _services: IService[];

  public constructor(
    @Inject(UnixSignalServiceToken) signals: IUnixSignalService,
    @Inject(HaveibeenpwnedServiceToken) haveibeenpwned: IHaveibeenpwnedService,
    @Inject(ConfigurationServiceToken) config: IConfigurationService,
    @Inject(LoggerServiceToken) logger: ILoggerService,
    @Inject(SlackNotificationServiceToken) slack: ISlackNotificationService,
    @Inject(BootShutdownNotificationServiceToken)
    bootShutdownNotifier: IBootShutdownNotificationService,
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
      signals,
      haveibeenpwned,
      config,
      logger,
      slack,
      bootShutdownNotifier,
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
