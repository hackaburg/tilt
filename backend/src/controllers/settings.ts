import { Authorized, Body, Get, JsonController, Put } from "routing-controllers";
import { Inject } from "typedi";
import { UserRole } from "../../../types/roles";
import { ISettings } from "../../../types/settings";
import { ISettingsService, SettingsServiceToken } from "../services/settings";
import { UpdateSettingsApiRequest } from "../validation/update-settings";

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
   * Updates the application settings.
   */
  @Put()
  @Authorized(UserRole.Owner)
  public async updateSettings(@Body() { data: settings }: UpdateSettingsApiRequest): Promise<void> {
    await this._settings.updateSettings(settings);
  }
}
