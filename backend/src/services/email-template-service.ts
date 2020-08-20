import { Inject, Service, Token } from "typedi";
import { IService } from ".";
import { EmailTemplate } from "../entities/settings";
import { User } from "../entities/user";
import { EmailServiceToken, IEmailService } from "./email-service";
import { ISettingsService, SettingsServiceToken } from "./settings-service";

interface IVerifyEmailContext {
  verifyToken: string;
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

  /**
   * Sends a "you're in" email to the given user.
   * @param user The user expecting the admissioin email
   */
  sendAdmittedEmail(user: User): Promise<void>;
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
  ) {}

  /**
   * @inheritdoc
   */
  public async bootstrap(): Promise<void> {
    return;
  }

  /**
   * Replaces all variables from the given context in the given text.
   * @param text The text to compile
   * @param context The context to inject into the template
   */
  private compile<TContext>(text: string, context: TContext): string {
    return [...Object.entries(context)].reduce(
      (replacedText, [variable, value]) =>
        replacedText.replace(new RegExp(`{{${variable}}}`, "g"), value),
      text,
    );
  }

  /**
   * Compiles a template with the given context.
   * @param template The template to use for compilation
   * @param context The context to inject into the template
   */
  private compileTemplate<TContext>(
    template: EmailTemplate,
    context: TContext,
  ): EmailTemplate {
    return {
      htmlTemplate: this.compile(template.htmlTemplate, context),
      subject: this.compile(template.subject, context),
      textTemplate: this.compile(template.textTemplate, context),
    };
  }

  /**
   * @inheritdoc
   */
  public async sendVerifyEmail(user: User): Promise<void> {
    const { email } = await this._settings.getSettings();
    const template = this.compileTemplate<IVerifyEmailContext>(
      email.verifyEmail,
      {
        verifyToken: user.verifyToken,
      },
    );

    await this._email.sendEmail(
      email.sender,
      user.email,
      template.subject,
      template.htmlTemplate,
      template.textTemplate,
    );
  }

  /**
   * @inheritdoc
   */
  public async sendAdmittedEmail(user: User): Promise<void> {
    const { email } = await this._settings.getSettings();
    const template = this.compileTemplate(email.admittedEmail, {});

    await this._email.sendEmail(
      email.sender,
      user.email,
      template.subject,
      template.htmlTemplate,
      template.textTemplate,
    );
  }
}
