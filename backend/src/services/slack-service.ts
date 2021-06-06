import { IncomingWebhook } from "@slack/webhook";
import { Inject, Service, Token } from "typedi";
import { IService } from ".";
import {
  ConfigurationServiceToken,
  IConfigurationService,
} from "./config-service";

/**
 * Describes a service to send Slack notifications.
 */
export interface ISlackNotificationService extends IService {
  /**
   * Sends a message to the configured Slack webhook.
   * @param text The message to send
   */
  sendMessage(text: string): Promise<void>;
}

/**
 * A token used to inject a concrete Slack notification service.
 */
export const SlackNotificationServiceToken =
  new Token<ISlackNotificationService>();

@Service(SlackNotificationServiceToken)
export class SlackNotificationService implements ISlackNotificationService {
  private _hook?: IncomingWebhook;

  constructor(
    @Inject(ConfigurationServiceToken)
    private readonly _config: IConfigurationService,
  ) {}

  /**
   * Sets up the Slack webhook.
   */
  public async bootstrap(): Promise<void> {
    const url = this._config.config.log.slackWebhookUrl;

    if (url) {
      this._hook = new IncomingWebhook(url);
    }
  }

  /**
   * Sends a message to the configured Slack webhook.
   * @param text The text to send
   */
  public async sendMessage(text: string): Promise<void> {
    if (!this._hook) {
      return;
    }

    await this._hook.send({
      text,
    });
  }
}
