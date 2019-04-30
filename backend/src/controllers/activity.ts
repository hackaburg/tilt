import { Authorized, Get, JsonController } from "routing-controllers";
import { Inject } from "typedi";
import { UserRole } from "../../../types/roles";
import { Activity } from "../entities/activity";
import { ActivityServiceToken, IActivityService } from "../services/activity";

@JsonController("/activity")
export class ActivityController {
  public constructor(
    @Inject(ActivityServiceToken) private readonly _activity: IActivityService,
  ) { }

  /**
   * Gets the activity log.
   */
  @Get()
  @Authorized(UserRole.Moderator)
  public async getAllActivities(): Promise<Activity[]> {
    return await this._activity.getActivities();
  }
}
