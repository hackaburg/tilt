import { Inject, Service, Token } from "typedi";
import { Repository } from "typeorm";
import { IService } from ".";
import { IRecursivePartial } from "../../../types/api";
import { IEmailSettings, IEmailTemplate, IFrontendSettings, ISettings } from "../../../types/settings";
import { Settings } from "../entities/settings";
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
      this._logger.info("no settings found. creating defaults");

      const defaultSettings = new Settings();
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

  /**
   * Updates all settings.
   * @param changes The updated settings
   */
  public async updateSettings(changes: IRecursivePartial<ISettings>): Promise<void> {
    const settings = await this.getSettings();

    if (changes.email) {
      this.updateEmailSettings(settings.email, changes.email);
    }

    if (changes.frontend) {
      this.updateFrontendSettings(settings.frontend, changes.frontend);
    }

    await this._settings!.save(settings);
  }
}
