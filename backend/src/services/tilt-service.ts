import { Inject, Service } from "typedi";
import { IService } from ".";
import {
  ApplicationServiceToken,
  IApplicationService,
} from "./application-service";
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
import { IPruneService, PruneServiceToken } from "./prune-service";
import {
  IQuestionGraphService,
  QuestionGraphServiceToken,
} from "./question-service";
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
    @Inject(TokenServiceToken) tokens: ITokenService<any>,
    @Inject(UserServiceToken) users: IUserService,
    @Inject(SettingsServiceToken) settings: ISettingsService,
    @Inject(QuestionGraphServiceToken) questions: IQuestionGraphService,
    @Inject(ApplicationServiceToken) application: IApplicationService,
    @Inject(PruneServiceToken) prune: IPruneService,
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
      tokens,
      users,
      settings,
      questions,
      application,
      prune,
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
        const message =
          error instanceof Error ? `${error}\n${error.stack}` : String(error);

        // tslint:disable-next-line: no-console
        console.error(`unable to load service: ${message}`);
        process.exit(1);
      }
    }
  }
}
