import { Service } from "typedi";
import { Repository } from "typeorm";
import { IService } from ".";
import { ActivityEvent } from "../../../types/activity";
import { Activity } from "../entities/activity";
import { User, deletePrivateUserFields } from "../entities/user";
import { DatabaseService } from "./database";

/**
 * A service to log activities in tilt.
 */
@Service()
export class ActivityService implements IService {
  private _activities?: Repository<Activity>;

  public constructor(
    private readonly _database: DatabaseService,
  ) { }

  /**
   * Sets up the activity service.
   */
  public async bootstrap(): Promise<void> {
    this._activities = this._database.getRepository(Activity);
  }

  /**
   * Adds an activity to the log.
   * @param user The user who did the activity
   * @param event The performed activity
   */
  public async addActivity(user: User, event: ActivityEvent, additionalData?: string): Promise<void> {
    const activity = new Activity();
    activity.user = user;
    activity.event = event;
    activity.timestamp = new Date();

    if (additionalData) {
      activity.data = additionalData;
    }

    await this._activities!.save(activity);
  }

  /**
   * Gets all the previous activity.
   */
  public async getActivity(): Promise<Activity[]> {
    const activities = await this._activities!.find({
      relations: [
        "user",
      ],
    });

    return activities.map((activity) => {
      activity.user = deletePrivateUserFields(activity.user);
      return activity;
    });
  }
}
