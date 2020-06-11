import { Inject, Service, Token } from "typedi";
import { Repository } from "typeorm";
import { IService } from ".";
import { ApplicationSettings } from "../entities/application-settings";
import { FormSettings } from "../entities/form-settings";
import {
  EmailSettings,
  EmailTemplate,
  FrontendSettings,
  Settings,
} from "../entities/settings";
import { DatabaseServiceToken, IDatabaseService } from "./database-service";
import { ILoggerService, LoggerServiceToken } from "./logger-service";

/**
 * Describes a service to retrieve the application's settings.
 */
export interface ISettingsService extends IService {
  /**
   * Gets the application settings.
   */
  getSettings(): Promise<Settings>;

  /**
   * Updates all settings.
   * @param settings The updated settings
   */
  updateSettings(settings: Settings): Promise<Settings>;
}

/**
 * A token used to inject a concrete settings service.
 */
export const SettingsServiceToken = new Token<ISettingsService>();

@Service(SettingsServiceToken)
export class SettingsService implements ISettingsService {
  private _settings!: Repository<Settings>;

  public constructor(
    @Inject(DatabaseServiceToken) private readonly _database: IDatabaseService,
    @Inject(LoggerServiceToken) private readonly _logger: ILoggerService,
  ) {}

  /**
   * Sets up the settings service.
   */
  public async bootstrap(): Promise<void> {
    this._settings = this._database.getRepository(Settings);
  }

  /**
   * Gets the application settings.
   */
  public async getSettings(): Promise<Settings> {
    try {
      return await this._settings.findOneOrFail();
    } catch (error) {
      this._logger.debug(`error loading settings: ${error.message}`);
      this._logger.info("no settings found. creating defaults");
      const settings = this.getDefaultSettings();
      await this._settings.save(settings);
      this._logger.debug("default settings saved", settings);
      return settings;
    }
  }

  /**
   * Creates a settings object with default values.
   */
  private getDefaultSettings(): Settings {
    const settings = new Settings();
    settings.application = this.getDefaultApplicationSettings();
    settings.frontend = this.getDefaultFrontendSettings();
    settings.email = this.getDefaultEmailSettings();
    return settings;
  }

  /**
   * Creates a application settings object with default values.
   */
  private getDefaultApplicationSettings(): ApplicationSettings {
    const applicationSettings = new ApplicationSettings();
    applicationSettings.profileForm = this.getDefaultFormSettings();
    applicationSettings.confirmationForm = this.getDefaultFormSettings();
    applicationSettings.allowProfileFormFrom = new Date();
    applicationSettings.allowProfileFormUntil = new Date();
    applicationSettings.hoursToConfirm = 24;
    return applicationSettings;
  }

  /**
   * Creates a form settings object with default values.
   */
  private getDefaultFormSettings(): FormSettings {
    const formSettings = new FormSettings();
    formSettings.title = "Form";
    formSettings.questions = [];
    return formSettings;
  }

  /**
   * Creates a frontend settings object with default values.
   */
  private getDefaultFrontendSettings(): FrontendSettings {
    const frontendSettings = new FrontendSettings();
    frontendSettings.colorGradientStart = "#53bd9a";
    frontendSettings.colorGradientEnd = "#56d175";
    frontendSettings.colorLink = "#007bff";
    frontendSettings.colorLinkHover = "#0056b3";
    frontendSettings.loginSignupImage = "http://placehold.it/300x300";
    frontendSettings.sidebarImage = "http://placehold.it/300x300";
    return frontendSettings;
  }

  /**
   * Creates a email settings object with default values.
   */
  private getDefaultEmailSettings(): EmailSettings {
    const emailSettings = new EmailSettings();
    emailSettings.verifyEmail = this.getDefaultEmailTemplate();
    emailSettings.forgotPasswordEmail = this.getDefaultEmailTemplate();
    emailSettings.sender = "tilt@hackaburg.de";
    return emailSettings;
  }

  /**
   * Creates a email template object with default values.
   */
  private getDefaultEmailTemplate(): EmailTemplate {
    const template = new EmailTemplate();
    template.htmlTemplate = "";
    template.subject = "";
    template.textTemplate = "";
    return template;
  }

  /**
   * Updates all settings.
   * @param changes The updated settings
   */
  public async updateSettings(settings: Settings): Promise<Settings> {
    return await this._settings.save(settings);
  }
}

/**
 * An error to signal updating the settings didn't work.
 */
export class UpdateSettingsError extends Error {
  constructor(message: string) {
    super(message);
  }
}
