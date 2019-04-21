import * as Handlebars from "handlebars";
import { Inject, Service, Token } from "typedi";
import { IService } from ".";
import { IEmailTemplates } from "../../../types/settings";
import { User } from "../entities/user";
import { EmailServiceToken, IEmailService } from "./email";
import { ISettingsService, SettingsServiceToken } from "./settings";

interface ICompiledEmailTemplate<TContext> {
  htmlTemplate: Handlebars.TemplateDelegate<TContext>;
  textTemplate: Handlebars.TemplateDelegate<TContext>;
  subject: Handlebars.TemplateDelegate<TContext>;
}

interface IDefaultEmailContext {
  email: string;
}

interface IVerifyEmailContext extends IDefaultEmailContext {
  verifyUrl: string;
}

/**
 * A service to send email templates.
 */
export interface IEmailTemplateService extends IService {
  /**
   * Sends a "verify your email address" email to the given user.
   * @param user The user expecting the verification email
   */
  sendVerifyEmail(user: User): Promise<void>;
}

/**
 * A token used to inject a concrete @see IEmailTemplateService.
 */
export const EmailTemplateServiceToken = new Token<IEmailTemplateService>();

@Service(EmailTemplateServiceToken)
export class EmailTemplateService implements IEmailTemplateService {
  public constructor(
    @Inject(SettingsServiceToken) private readonly _settings: ISettingsService,
    @Inject(EmailServiceToken) private readonly _email: IEmailService,
  ) { }

  /**
   * Bootstraps the email template service, i.e. noop, since no setup is required.
   */
  public async bootstrap(): Promise<void> {
    return;
  }

  /**
   * Gets a template by its name.
   * @param name The name of the template to retrieve
   */
  private async getTemplate<TContext>(name: keyof IEmailTemplates): Promise<ICompiledEmailTemplate<TContext>> {
    const { email } = await this._settings.getSettings();
    const emailTemplate = email.templates[name];

    return {
      htmlTemplate: Handlebars.compile(emailTemplate.htmlTemplate),
      subject: Handlebars.compile(emailTemplate.subject),
      textTemplate: Handlebars.compile(emailTemplate.textTemplate),
    };
  }

  /**
   * Sends a "verify your email address" email to the given user.
   * @param user The user expecting the verification email
   */
  public async sendVerifyEmail(user: User): Promise<void> {
    const template = await this.getTemplate<IVerifyEmailContext>("verifyEmail");
    const context: IVerifyEmailContext = {
      email: user.email,
      verifyUrl: user.verifyToken,
    };

    const subject = template.subject(context);
    const htmlBody = template.htmlTemplate(context);
    const textBody = template.textTemplate(context);

    await this._email.sendEmail("", user.email, subject, htmlBody, textBody);
  }
}
