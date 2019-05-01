import { Authorized, BadRequestError, Body, CurrentUser, Get, JsonController, Put } from "routing-controllers";
import { Inject } from "typedi";
import { ActivityType } from "../../../types/activity";
import { UserRole } from "../../../types/roles";
import { ISettings } from "../../../types/settings";
import { User } from "../entities/user";
import { ActivityServiceToken, IActivityService } from "../services/activity";
import { ISettingsService, SettingsServiceToken, UpdateSettingsError } from "../services/settings";
import { UpdateSettingsApiRequest } from "../validation/update-settings";

@JsonController("/settings")
export class SettingsController {
  public constructor(
    @Inject(SettingsServiceToken) private readonly _settings: ISettingsService,
    @Inject(ActivityServiceToken) private readonly _activity: IActivityService,
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
  public async updateSettings(@CurrentUser() user: User, @Body() { data: settings }: UpdateSettingsApiRequest): Promise<void> {
    try {
      const previousSettings = await this._settings.getSettings();
      const nextSettings = await this._settings.updateSettings(settings);

      await this._activity.addActivity(user, {
        next: nextSettings,
        previous: previousSettings,
        type: ActivityType.SettingsUpdate,
      });
    } catch (error) {
      if (error instanceof UpdateSettingsError) {
        throw new BadRequestError(error.message);
      }

      throw error;
    }
  }
}
