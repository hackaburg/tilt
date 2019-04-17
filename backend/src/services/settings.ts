import { Inject, Service, Token } from "typedi";
import { Repository } from "typeorm";
import { IService } from ".";
import { IEmailSettings, ISettings } from "../../../types/settings";
import { EmailSettings } from "../entities/email-settings";
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
   * Updates the email settings with the given settings.
   * @param emailSettings The updated email settings
   */
  updateEmailSettings(emailSettings: Partial<IEmailSettings>): Promise<void>;
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
   * Updates the email settings with the given templates.
   * @param settings The settings to use for the update
   */
  public async updateEmailSettings(settings: Partial<IEmailSettings>): Promise<void> {
    const settingsKeys = Object.keys(new EmailSettings()) as Array<keyof IEmailSettings>;
    const existingSettings = await this.getSettings();

    for (const key of settingsKeys) {
      const existingTemplate = existingSettings.email[key];
      const updatedTemplate = settings[key];

      if (updatedTemplate) {
        existingTemplate.htmlTemplate = updatedTemplate.htmlTemplate || existingTemplate.htmlTemplate;
        existingTemplate.textTemplate = updatedTemplate.textTemplate || existingTemplate.textTemplate;
      }
    }

    await this._settings!.save(existingSettings);
  }
}
