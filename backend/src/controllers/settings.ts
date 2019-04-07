import { Get, JsonController } from "routing-controllers";
import { Inject } from "typedi";
import { ISettings } from "../../../types/settings";
import { ISettingsService, SettingsServiceToken } from "../services/settings";

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
}
