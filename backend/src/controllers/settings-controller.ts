import {
  Authorized,
  BadRequestError,
  Body,
  Get,
  JsonController,
  Put,
} from "routing-controllers";
import { Inject } from "typedi";
import { UserRole } from "../../../types/roles";
import { ISettings } from "../../../types/settings";
import {
  ISettingsService,
  SettingsServiceToken,
  UpdateSettingsError,
} from "../services/settings-service";
import { UpdateSettingsApiRequest } from "../validation/update-settings";

@JsonController("/settings")
export class SettingsController {
  public constructor(
    @Inject(SettingsServiceToken) private readonly _settings: ISettingsService,
  ) {}

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
  @Authorized(UserRole.Root)
  public async updateSettings(
    @Body() { data: settings }: UpdateSettingsApiRequest,
  ): Promise<ISettings> {
    try {
      return await this._settings.updateSettings(settings);
    } catch (error) {
      if (error instanceof UpdateSettingsError) {
        throw new BadRequestError(error.message);
      }

      throw error;
    }
  }
}
