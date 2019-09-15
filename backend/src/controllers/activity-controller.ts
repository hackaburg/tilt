import { Authorized, Get, JsonController } from "routing-controllers";
import { Inject } from "typedi";
import { IActivity } from "../../../types/activity";
import { UserRole } from "../../../types/roles";
import { ActivityServiceToken, IActivityService } from "../services/activity-service";

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
  public async getAllActivities(): Promise<IActivity[]> {
    return await this._activity.getActivities();
  }
}
