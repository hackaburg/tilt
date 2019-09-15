import { Inject, Service, Token } from "typedi";
import { IService } from ".";
import { ILoggerService, LoggerServiceToken } from "./logger-service";
import { ISlackNotificationService, SlackNotificationServiceToken } from "./slack-service";
import { IUnixSignalService, UnixSignalServiceToken } from "./unix-signal-service";

/**
 * A service to notify about pending shutdowns.
 */
// tslint:disable-next-line: no-empty-interface
export interface IBootShutdownNotificationService extends IService { }

/**
 * A token used to inject a concrete boot shutdown notifier.
 */
export const BootShutdownNotificationServiceToken = new Token<IBootShutdownNotificationService>();

@Service(BootShutdownNotificationServiceToken)
export class BootShutdownNotificationService implements IBootShutdownNotificationService {
  constructor(
    @Inject(LoggerServiceToken) private readonly _logger: ILoggerService,
    @Inject(SlackNotificationServiceToken) private readonly _slack: ISlackNotificationService,
    @Inject(UnixSignalServiceToken) private readonly _signals: IUnixSignalService,
  ) { }

  /**
   * Registers signals to listen on and notifies the configured Slack webhook about state changes.
   */
  public async bootstrap(): Promise<void> {
    this._signals.registerSignalHandler("SIGINT", async (signal) => {
      const message = `received signal "${signal}", shutting down`;

      await this._slack.sendMessage(message);
      this._logger.debug(message);
    });

    await this._slack.sendMessage("tilt started");
    this._logger.debug("registered signal handler");
  }
}
