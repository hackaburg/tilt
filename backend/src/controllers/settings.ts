import { Authorized, Body, Get, JsonController, Put } from "routing-controllers";
import { Inject } from "typedi";
import { UserRole } from "../../../types/roles";
import { ISettings } from "../../../types/settings";
import { ISettingsService, SettingsServiceToken } from "../services/settings";
import { UpdateEmailSettingsApiRequest } from "../validation/email-settings";
import { UpdateEmailTemplatesApiRequest } from "../validation/email-templates";

@JsonController("/settings")
export class SettingsController {
  public constructor(
    @Inject(SettingsServiceToken) private readonly _settings: ISettingsService,
  ) { }

  /**
   * Gets the application settings.
   */
  @Get()
  public async getSettings(): Promise<ISettings> {
    return await this._settings.getSettings();
  }

  /**
   * Updates the email settings, e.g. the email sender.
   */
  @Put("/email")
  @Authorized(UserRole.Owner)
  public async updateEmailSettings(@Body() { data: settings }: UpdateEmailSettingsApiRequest): Promise<void> {
    await this._settings.updateEmailSettings(settings);
  }

  /**
   * Updates the email templates.
   */
  @Put("/email/templates")
  @Authorized(UserRole.Owner)
  public async updateEmailTemplates(@Body() { data: templates }: UpdateEmailTemplatesApiRequest): Promise<void> {
    await this._settings.updateEmailTemplates(templates);
  }
}
