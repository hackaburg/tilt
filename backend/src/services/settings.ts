import { Inject, Service, Token } from "typedi";
import { Repository } from "typeorm";
import { IService } from ".";
import { IRecursivePartial } from "../../../types/api";
import { IQuestion, QuestionType } from "../../../types/questions";
import { IActivatable, IApplicationSettings, IEmailSettings, IEmailTemplate, IFormSettings, IFrontendSettings, ISettings } from "../../../types/settings";
import { ApplicationSettings } from "../entities/application-settings";
import { ChoicesQuestion } from "../entities/choices-question";
import { CountryQuestion } from "../entities/country-question";
import { EmailSettings } from "../entities/email-settings";
import { EmailTemplate } from "../entities/email-template";
import { FormSettings } from "../entities/form-settings";
import { FrontendSettings } from "../entities/frontend-settings";
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
  updateSettings(settings: IRecursivePartial<ISettings>): Promise<ISettings>;
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
      return await this._settings!.findOneOrFail({
        where: {
          active: true,
        },
      });
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
   * Applies the changes from the given object to the new one, using existing values where there's no change given.
   * @param existing The stored object
   * @param changed Changes to apply to the object
   * @param destination A new object to apply the changes on
   */
  private applyChanges<T>(existing: T, changed: T, destination: T): void {
    const keys = Object.keys(existing) as Array<keyof T>;

    for (const key of keys) {
      if (key === "id") {
        continue;
      }

      const existingValue = existing[key];
      const changedValue = changed[key];

      destination[key] = this.getDefinedValue(existingValue, changedValue);
    }
  }

  /**
   * Updates the email template if the values are set.
   * @param existing The existing email template
   * @param changes The changed email template
   */
  private updateEmailTemplate(existing: IEmailTemplate, changes: IRecursivePartial<IEmailTemplate>): IEmailTemplate {
    const updated = new EmailTemplate();
    this.applyChanges(existing, changes, updated);
    return updated;
  }

  /**
   * Updates the email settings if the values are set.
   * @param existing The existing email settings
   * @param changes The changed email settings
   */
  private updateEmailSettings(existing: IEmailSettings, changes: IRecursivePartial<IEmailSettings>): IEmailSettings {
    const updated = new EmailSettings();
    this.applyChanges(existing, changes, updated);

    updated.verifyEmail =
      changes.verifyEmail
        ? this.updateEmailTemplate(existing.verifyEmail, changes.verifyEmail)
        : existing.verifyEmail;

    updated.forgotPasswordEmail =
      changes.forgotPasswordEmail
        ? this.updateEmailTemplate(existing.forgotPasswordEmail, changes.forgotPasswordEmail)
        : existing.forgotPasswordEmail;

    return updated;
  }

  /**
   * Updates the frontend settings if the values are set.
   * @param existing The existing frontend settings
   * @param changes The changed frontend settings
   */
  private updateFrontendSettings(existing: IFrontendSettings, changes: IRecursivePartial<IFrontendSettings>): IFrontendSettings {
    const updated = new FrontendSettings();
    this.applyChanges(existing, changes, updated);
    return updated;
  }

  /**
   * Creates a question from the given type.
   * @param type The question's type
   */
  private createQuestion(type: QuestionType): IQuestion {
    switch (type) {
      case QuestionType.Choices:
        return new ChoicesQuestion(true);

      case QuestionType.Country:
        return new CountryQuestion(true);

      case QuestionType.Number:
        return new NumberQuestion(true);

      case QuestionType.Text:
        return new TextQuestion(true);

      default:
        enforceExhaustiveSwitch(type);
        throw new UpdateSettingsError("unknown question type");
    }
  }

  /**
   * Updates the form settings if the values are set.
   * @param existing The existing form settings
   * @param changes The changed form settings
   */
  private updateFormSettings(existing: IFormSettings, changes: IRecursivePartial<IFormSettings>): IFormSettings {
    const updated = new FormSettings();
    this.applyChanges(existing, changes, updated);

    updated.questions =
      changes.questions
        ? (
          changes.questions.map((changedQuestion) => {
            const existingQuestion = existing.questions.find((question) => (
              question.referenceName === changedQuestion.referenceName
              && question.type === changedQuestion.type
            )) || this.createQuestion(changedQuestion.type);

            const updatedQuestion = this.createQuestion(changedQuestion.type);
            this.applyChanges(existingQuestion, changedQuestion, updatedQuestion);

            return updatedQuestion;
          })
        )
        : existing.questions;

    return updated;
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
  private updateApplicationSettings(existing: IApplicationSettings, changes: IRecursivePartial<IApplicationSettings>): IApplicationSettings {
    const updated = new ApplicationSettings();
    this.applyChanges(existing, changes, updated);

    if (updated.allowProfileFormFrom.getTime() > updated.allowProfileFormUntil.getTime()) {
      throw new UpdateSettingsError("profile form closes before it's open, check your times");
    }

    const referenceNames = this.getAllReferenceNames(changes);
    const duplicateReferenceName = this.getFirstDuplicate(referenceNames);

    if (duplicateReferenceName) {
      throw new UpdateSettingsError(`duplicate reference name "${duplicateReferenceName}"`);
    }

    updated.profileForm =
      changes.profileForm
        ? this.updateFormSettings(existing.profileForm, changes.profileForm)
        : existing.profileForm;

    updated.confirmationForm =
      changes.confirmationForm
        ? this.updateFormSettings(existing.confirmationForm, changes.confirmationForm)
        : existing.confirmationForm;

    return updated;
  }

  /**
   * Updates all settings.
   * @param changes The updated settings
   */
  public async updateSettings(changes: IRecursivePartial<ISettings>): Promise<ISettings> {
    const updated = new Settings();
    const existing = await this.getSettings() as IActivatable<ISettings>;
    this.applyChanges(existing, changes, updated);

    updated.application =
      changes.application
        ? this.updateApplicationSettings(existing.application, changes.application)
        : existing.application;

    updated.email =
      changes.email
        ? this.updateEmailSettings(existing.email, changes.email)
        : existing.email;

    updated.frontend =
      changes.frontend
        ? this.updateFrontendSettings(existing.frontend, changes.frontend)
        : existing.frontend;

    existing.active = false;
    await this._settings!.save(existing);
    await this._settings!.save(updated);
    return updated;
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
