import { createTransport, Transporter } from "nodemailer";
import { Inject, Service, Token } from "typedi";
import { IService } from ".";
import { ConfigurationServiceToken, IConfigurationService } from "./config-service";
import { ILoggerService, LoggerServiceToken } from "./logger-service";

/**
 * Describes how to send emails.
 */
export interface IEmailService extends IService {
  /**
   * Sends a mail with the given properties.
   * @param from The sender email
   * @param to The receiver email
   * @param subject The subject
   * @param htmlBody The body in HTML
   * @param textBody The body in plaintext
   */
  sendEmail(from: string, to: string, subject: string, htmlBody: string, textBody: string): Promise<void>;
}

/**
 * A token used to inject a concrete email service.
 */
export const EmailServiceToken = new Token<IEmailService>();

@Service(EmailServiceToken)
export class EmailService implements IEmailService {
  private _transporter!: Transporter;

  public constructor(
    @Inject(ConfigurationServiceToken) private readonly _config: IConfigurationService,
    @Inject(LoggerServiceToken) private readonly _logger: ILoggerService,
  ) { }

  /**
   * Sets up the email service.
   */
  public async bootstrap(): Promise<void> {
    const { username, password, host, port } = this._config.config.mail;
    this._transporter = createTransport({
      auth: {
        pass: password,
        user: username,
      },
      host,
      pool: true,
      port,
    });

    this._logger.info(`connected to smtp on ${host}`);
  }

  /**
   * Sends a mail with the given properties.
   * @param from The sender email
   * @param to The receiver email
   * @param subject The subject
   * @param htmlBody The body in HTML
   * @param textBody The body in plaintext
   */
  public async sendEmail(from: string, to: string, subject: string, htmlBody: string, textBody: string): Promise<void> {
    const info = await this._transporter!.sendMail({
      from,
      html: htmlBody,
      subject,
      text: textBody,
      to,
    });

    this._logger.debug(`sent email to ${to}`, { ...info });
  }
}
