import * as Handlebars from "handlebars";
import { Inject, Service, Token } from "typedi";
import { IService } from ".";
import { IEmailTemplate } from "../../../types/settings";
import { User } from "../entities/user";
import { EmailServiceToken, IEmailService } from "./email";
import { ISettingsService, SettingsServiceToken } from "./settings";

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
   * Compiles a template with the given context.
   * @param template The template to use for compilation
   * @param context The context to inject into the template
   */
  private compileTemplate<TContext>(template: IEmailTemplate, context: TContext): IEmailTemplate {
    return {
      htmlTemplate: Handlebars.compile(template.htmlTemplate)(context),
      subject: Handlebars.compile(template.subject)(context),
      textTemplate: Handlebars.compile(template.textTemplate)(context),
    };
  }

  /**
   * Sends a "verify your email address" email to the given user.
   * @param user The user expecting the verification email
   */
  public async sendVerifyEmail(user: User): Promise<void> {
    const { email } = await this._settings.getSettings();
    const template = this.compileTemplate<IVerifyEmailContext>(email.verifyEmail, {
      email: user.email,
      verifyUrl: user.verifyToken,
    });

    await this._email.sendEmail(email.sender, user.email, template.subject, template.htmlTemplate, template.textTemplate);
  }
}
