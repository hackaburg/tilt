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
import { Settings } from "../entities/settings";
import {
  ISettingsService,
  SettingsServiceToken,
  UpdateSettingsError,
} from "../services/settings-service";
import {
  convertBetweenEntityAndDTO,
  SettingsDTO,
  UpdateSettingsRequestDTO,
} from "./dto";

@JsonController("/settings")
export class SettingsController {
  public constructor(
    @Inject(SettingsServiceToken) private readonly _settings: ISettingsService,
  ) {}

  /**
   * Gets the application settings.
   */
  @Get()
  public async getSettings(): Promise<SettingsDTO> {
    const settings = await this._settings.getSettings();
    return convertBetweenEntityAndDTO(settings, SettingsDTO);
  }

  /**
   * Updates the application settings.
   */
  @Put()
  @Authorized(UserRole.Root)
  public async updateSettings(
    @Body() { data: settingsDTO }: UpdateSettingsRequestDTO,
  ): Promise<SettingsDTO> {
    try {
      const settings = convertBetweenEntityAndDTO(settingsDTO, Settings);
      const updatedSettings = await this._settings.updateSettings(settings);
      return convertBetweenEntityAndDTO(updatedSettings, SettingsDTO);
    } catch (error) {
      if (error instanceof UpdateSettingsError) {
        throw new BadRequestError(error.message);
      }

      throw error;
    }
  }
}
