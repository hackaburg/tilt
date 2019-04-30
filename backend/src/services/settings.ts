import { Inject, Service, Token } from "typedi";
import { Repository } from "typeorm";
import { IService } from ".";
import { IRecursivePartial } from "../../../types/api";
import { IChoicesQuestion, INumberQuestion, IQuestion, ITextQuestion, QuestionType } from "../../../types/questions";
import { IApplicationSettings, IEmailSettings, IEmailTemplate, IFormSettings, IFrontendSettings, ISettings } from "../../../types/settings";
import { ChoicesQuestion } from "../entities/choices-question";
import { CountryQuestion } from "../entities/country-question";
import { NumberQuestion } from "../entities/number-question";
import { Settings } from "../entities/settings";
import { TextQuestion } from "../entities/text-question";
import { enforceExhaustiveSwitch } from "../utils/switch";
import { DatabaseServiceToken, IDatabaseService } from "./database";
import { ILoggerService, LoggerServiceToken } from "./log";

/**
 * Describes a service to retrieve the application's settings.
 */
export interface ISettingsService extends IService {
  /**
   * Gets the application settings.
   */
  getSettings(): Promise<ISettings>;

  /**
   * Updates all settings.
   * @param settings The updated settings
   */
  updateSettings(settings: IRecursivePartial<ISettings>): Promise<void>;
}

/**
 * A token used to inject a concrete settings service.
 */
export const SettingsServiceToken = new Token<ISettingsService>();

@Service(SettingsServiceToken)
export class SettingsService implements ISettingsService {
  private _settings?: Repository<Settings>;

  public constructor(
    @Inject(DatabaseServiceToken) private readonly _database: IDatabaseService,
    @Inject(LoggerServiceToken) private readonly _logger: ILoggerService,
  ) { }

  /**
   * Sets up the settings service.
   */
  public async bootstrap(): Promise<void> {
    this._settings = this._database.getRepository(Settings);
  }

  /**
   * Gets the application settings.
   */
  public async getSettings(): Promise<ISettings> {
    try {
      return await this._settings!.findOneOrFail();
    } catch (error) {
      this._logger.debug(`error loading settings: ${error.message}`);
      this._logger.info("no settings found. creating defaults");

      const defaultSettings = new Settings(true);
      await this._settings!.save(defaultSettings);

      this._logger.debug("default settings saved", defaultSettings);

      return defaultSettings;
    }
  }

  /**
   * Gets the value that's defined. If the changed value is undefined, the existing value will be used.
   * @param existing The existing value
   * @param changed The changed value
   */
  private getDefinedValue<T>(existing: T, changed?: T): T {
    if (changed === undefined) {
      return existing;
    }

    return changed;
  }

  /**
   * Updates the email template if the values are set.
   * @param existing The existing email template
   * @param changes The changed email template
   */
  private updateEmailTemplate(existing: IEmailTemplate, changes: IRecursivePartial<IEmailTemplate>): void {
    existing.htmlTemplate = this.getDefinedValue(existing.htmlTemplate, changes.htmlTemplate);
    existing.subject = this.getDefinedValue(existing.subject, changes.subject);
    existing.textTemplate = this.getDefinedValue(existing.textTemplate, changes.textTemplate);
  }

  /**
   * Updates the email settings if the values are set.
   * @param existing The existing email settings
   * @param changes The changed email settings
   */
  private updateEmailSettings(existing: IEmailSettings, changes: IRecursivePartial<IEmailSettings>): void {
    existing.sender = this.getDefinedValue(existing.sender, changes.sender);

    if (changes.forgotPasswordEmail) {
      this.updateEmailTemplate(existing.forgotPasswordEmail, changes.forgotPasswordEmail);
    }

    if (changes.verifyEmail) {
      this.updateEmailTemplate(existing.verifyEmail, changes.verifyEmail);
    }
  }

  /**
   * Updates the frontend settings if the values are set.
   * @param existing The existing frontend settings
   * @param changes The changed frontend settings
   */
  private updateFrontendSettings(existing: IFrontendSettings, changes: IRecursivePartial<IFrontendSettings>): void {
    existing.colorGradientEnd = this.getDefinedValue(existing.colorGradientEnd, changes.colorGradientEnd);
    existing.colorGradientStart = this.getDefinedValue(existing.colorGradientStart, changes.colorGradientStart);
    existing.colorLink = this.getDefinedValue(existing.colorLink, changes.colorLink);
    existing.colorLinkHover = this.getDefinedValue(existing.colorLinkHover, changes.colorLinkHover);
    existing.loginSignupImage = this.getDefinedValue(existing.loginSignupImage, changes.loginSignupImage);
    existing.sidebarImage = this.getDefinedValue(existing.sidebarImage, changes.sidebarImage);
  }

  private updateQuestion(existing: IQuestion, changes: IQuestion): void {
    existing.description = this.getDefinedValue(existing.description, changes.description);
    existing.mandatory = this.getDefinedValue(existing.mandatory, changes.mandatory);
    existing.parentReferenceName = this.getDefinedValue(existing.parentReferenceName, changes.parentReferenceName);
    existing.referenceName = this.getDefinedValue(existing.referenceName, changes.referenceName);
    existing.showIfParentHasValue = this.getDefinedValue(existing.showIfParentHasValue, changes.showIfParentHasValue);
    existing.title = this.getDefinedValue(existing.title, changes.title);

    switch (existing.type) {
      case QuestionType.Choices:
        const changedChoiceQuestion = changes as IChoicesQuestion;
        existing.choices = this.getDefinedValue(existing.choices, changedChoiceQuestion.choices);
        existing.allowMultiple = this.getDefinedValue(existing.allowMultiple, changedChoiceQuestion.allowMultiple);
        existing.displayAsDropdown = this.getDefinedValue(existing.displayAsDropdown, changedChoiceQuestion.displayAsDropdown);
        break;

      case QuestionType.Number:
        const changedNumberQuestion = changes as INumberQuestion;
        existing.allowDecimals = this.getDefinedValue(existing.allowDecimals, changedNumberQuestion.allowDecimals);
        existing.minValue = this.getDefinedValue(existing.minValue, changedNumberQuestion.minValue);
        existing.maxValue = this.getDefinedValue(existing.maxValue, changedNumberQuestion.maxValue);
        existing.placeholder = this.getDefinedValue(existing.placeholder, changedNumberQuestion.placeholder);
        break;

      case QuestionType.Text:
        const changedTextQuestion = changes as ITextQuestion;
        existing.placeholder = this.getDefinedValue(existing.placeholder, changedTextQuestion.placeholder);
        existing.multiline = this.getDefinedValue(existing.multiline, changedTextQuestion.multiline);
        break;

      case QuestionType.Country:
        break;

      default:
        enforceExhaustiveSwitch(existing);
        break;
    }
  }

  /**
   * Creates a question from the given type.
   * @param type The question's type
   */
  private createQuestion(type: QuestionType): IQuestion {
    switch (type) {
      case QuestionType.Choices:
        return new ChoicesQuestion();

      case QuestionType.Country:
        return new CountryQuestion();

      case QuestionType.Number:
        return new NumberQuestion();

      case QuestionType.Text:
        return new TextQuestion();

      default:
        enforceExhaustiveSwitch(type);
        throw new UpdateSettingsError("unknown question type");
    }
  }

  /**
   * Creates or updates
   * @param existing The existing question to update, or undefined if there's no such question
   * @param changes The changes to apply to this question
   */
  private createOrUpdateQuestion<T extends IQuestion>(existing: T | undefined, changes: T): IQuestion {
    const questionToUpdate = existing ? existing : this.createQuestion(changes.type);
    this.updateQuestion(questionToUpdate, changes);
    return questionToUpdate;
  }

  /**
   * Updates the form settings if the values are set.
   * @param existing The existing form settings
   * @param changes The changed form settings
   */
  private updateFormSettings(existing: IFormSettings, changes: IRecursivePartial<IFormSettings>): void {
    existing.title = this.getDefinedValue(existing.title, changes.title);

    if (changes.questions) {
      existing.questions = changes.questions.map((changedQuestion) => {
        const existingQuestion = existing.questions.find((question) => (
          question.referenceName === changedQuestion.referenceName
          && question.type === changedQuestion.type
        ));

        return this.createOrUpdateQuestion(existingQuestion, changedQuestion);
      });
    }
  }

  /**
   * Creates an array of all reference names provided in the changed application settings.
   * @param changes The changed application settings
   */
  private getAllReferenceNames(changes: IRecursivePartial<IApplicationSettings>): string[] {
    return [
      ...(
        changes.profileForm && changes.profileForm.questions
          ? changes.profileForm.questions.map(({ referenceName }) => referenceName)
          : []
      ),
      ...(
        changes.confirmationForm && changes.confirmationForm.questions
          ? changes.confirmationForm.questions.map(({ referenceName }) => referenceName)
          : []
      ),
    ];
  }

  /**
   * Searches the array for duplicates and returns the first one.
   * @param items An array, which possibly contains duplicates
   */
  private getFirstDuplicate(items: string[]): string | undefined {
    const uniqueItems = new Set(items);

    if (items.length !== uniqueItems.size) {
      const duplicates = items.filter((item) => {
        if (uniqueItems.has(item)) {
          uniqueItems.delete(item);
          return false;
        }

        return true;
      });

      return duplicates[0];
    }
  }

  /**
   * Updates the application settings if the values are set.
   * @param existing The existing application settings
   * @param changes The changed application settings
   */
  private updateApplicationSettings(existing: IApplicationSettings, changes: IRecursivePartial<IApplicationSettings>): void {
    existing.allowProfileFormFrom = this.getDefinedValue(existing.allowProfileFormFrom, changes.allowProfileFormFrom) as Date;
    existing.allowProfileFormUntil = this.getDefinedValue(existing.allowProfileFormUntil, changes.allowProfileFormUntil) as Date;

    if (existing.allowProfileFormFrom.getTime() > existing.allowProfileFormUntil.getTime()) {
      throw new UpdateSettingsError("profile form closes before it's open, check your times");
    }

    existing.hoursToConfirm = this.getDefinedValue(existing.hoursToConfirm, changes.hoursToConfirm);

    const referenceNames = this.getAllReferenceNames(changes);
    const duplicateReferenceName = this.getFirstDuplicate(referenceNames);

    if (duplicateReferenceName) {
      throw new UpdateSettingsError(`duplicate reference name "${duplicateReferenceName}"`);
    }

    if (changes.profileForm) {
      this.updateFormSettings(existing.profileForm, changes.profileForm);
    }

    if (changes.confirmationForm) {
      this.updateFormSettings(existing.confirmationForm, changes.confirmationForm);
    }
  }

  /**
   * Updates all settings.
   * @param changes The updated settings
   */
  public async updateSettings(changes: IRecursivePartial<ISettings>): Promise<void> {
    const settings = await this.getSettings();

    if (changes.application) {
      this.updateApplicationSettings(settings.application, changes.application);
    }

    if (changes.email) {
      this.updateEmailSettings(settings.email, changes.email);
    }

    if (changes.frontend) {
      this.updateFrontendSettings(settings.frontend, changes.frontend);
    }

    await this._settings!.save(settings);
  }
}

/**
 * An error to signal updating the settings didn't work.
 */
export class UpdateSettingsError {
  public readonly message: string;
  constructor(message: string) {
    this.message = message;
  }
}
