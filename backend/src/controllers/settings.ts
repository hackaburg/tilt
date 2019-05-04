import { Authorized, BadRequestError, Body, CurrentUser, Get, JsonController, Put } from "routing-controllers";
import { Inject } from "typedi";
import { ActivityType } from "../../../types/activity";
import { UserRole } from "../../../types/roles";
import { ISettings } from "../../../types/settings";
import { WebSocketMessageType } from "../../../types/ws";
import { User } from "../entities/user";
import { ActivityServiceToken, IActivityService } from "../services/activity";
import { ISettingsService, SettingsServiceToken, UpdateSettingsError } from "../services/settings";
import { IWebSocketService, WebSocketServiceToken } from "../services/ws";
import { toPrettyJson } from "../utils/json";
import { UpdateSettingsApiRequest } from "../validation/update-settings";

@JsonController("/settings")
export class SettingsController {
  public constructor(
    @Inject(SettingsServiceToken) private readonly _settings: ISettingsService,
    @Inject(ActivityServiceToken) private readonly _activity: IActivityService,
    @Inject(WebSocketServiceToken) private readonly _ws: IWebSocketService,
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
  public async updateSettings(@CurrentUser() user: User, @Body() { data: settings }: UpdateSettingsApiRequest): Promise<ISettings> {
    try {
      const previousSettings = await this._settings.getSettings();
      const nextSettings = await this._settings.updateSettings(settings);

      const activity = await this._activity.addActivity(user, {
        next: toPrettyJson(nextSettings),
        previous: toPrettyJson(previousSettings),
        type: ActivityType.SettingsUpdate,
      });

      this._ws.broadcast(UserRole.Moderator, {
        activity: [
          activity,
        ],
        type: WebSocketMessageType.Activity,
      });

      return nextSettings;
    } catch (error) {
      if (error instanceof UpdateSettingsError) {
        throw new BadRequestError(error.message);
      }

      throw error;
    }
  }
}
