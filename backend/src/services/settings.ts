import { Inject, Service, Token } from "typedi";
import { Repository } from "typeorm";
import { IService } from ".";
import { IEmailSettings, IEmailTemplates, ISettings } from "../../../types/settings";
import { EmailTemplates } from "../entities/email-templates";
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
   * Updates the email settings.
   * @param settings The updated email settings
   */
  updateEmailSettings(settings: Partial<IEmailSettings>): Promise<void>;

  /**
   * Updates the email templates.
   * @param templates The updated email templates
   */
  updateEmailTemplates(templates: Partial<IEmailTemplates>): Promise<void>;
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
   * Updates the email settings.
   * @param settings The updated email settings
   */
  public async updateEmailSettings(settings: Partial<IEmailSettings>): Promise<void> {
    const existingSettings = await this.getSettings();
    existingSettings.email.sender = settings.sender || existingSettings.email.sender;
    await this._settings!.save(existingSettings);
  }

  /**
   * Updates the email templates.
   * @param templates The updated email templates
   */
  public async updateEmailTemplates(templates: Partial<IEmailTemplates>): Promise<void> {
    const settingsKeys = Object.keys(new EmailTemplates()) as Array<keyof IEmailTemplates>;
    const existingSettings = await this.getSettings();

    for (const key of settingsKeys) {
      const existingTemplate = existingSettings.email.templates[key];
      const updatedTemplate = templates[key];

      if (updatedTemplate) {
        existingTemplate.htmlTemplate = updatedTemplate.htmlTemplate;
        existingTemplate.textTemplate = updatedTemplate.textTemplate;
        existingTemplate.subject = updatedTemplate.subject;
      }
    }

    await this._settings!.save(existingSettings);
  }
}
