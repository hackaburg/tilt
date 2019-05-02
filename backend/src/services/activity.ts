import { Inject, Service, Token } from "typedi";
import { Repository } from "typeorm";
import { IService } from ".";
import { IActivity, IActivityData } from "../../../types/activity";
import { IUser } from "../../../types/user";
import { Activity } from "../entities/activity";
import { DatabaseServiceToken, IDatabaseService } from "./database";

/**
 * An interface describing the activity service, used to log activities.
 */
export interface IActivityService extends IService {
  /**
   * Adds an activity.
   * @param event The activity itself
   */
  addActivity(user: IUser, data: IActivityData): Promise<IActivity>;

  /**
   * Gets all previous activity.
   */
  getActivities(): Promise<IActivity[]>;
}

/**
 * A token used to inject a concrete activity service.
 */
export const ActivityServiceToken = new Token<IActivityService>();

/**
 * A service to log activities in tilt.
 */
@Service(ActivityServiceToken)
export class ActivityService implements IService {
  private _activities?: Repository<Activity>;

  public constructor(
    @Inject(DatabaseServiceToken) private readonly _database: IDatabaseService,
  ) { }

  /**
   * Sets up the activity service.
   */
  public async bootstrap(): Promise<void> {
    this._activities = this._database.getRepository(Activity);
  }

  /**
   * Converts an activity entity to an @see IActivity object.
   */
  private convertActivityEntityToIActivity({ data, type, timestamp, user }: Activity): IActivity {
    return {
      data: {
        ...data,
        type,
      },
      timestamp: timestamp.getTime(),
      user: {
        email: user.email,
      },
    };
  }

  /**
   * Adds an activity to the log.
   * @param user The user who did the activity
   * @param event The performed activity
   */
  public async addActivity(user: IUser, { type, ...data }: IActivityData): Promise<IActivity> {
    const activity = new Activity();
    activity.user = user;
    activity.type = type;
    activity.timestamp = new Date();

    if (data) {
      activity.data = data;
    }

    await this._activities!.insert(activity);
    return this.convertActivityEntityToIActivity(activity);
  }

  /**
   * Gets all previous activity.
   */
  public async getActivities(): Promise<IActivity[]> {
    const activities = await this._activities!.find({
      relations: [
        "user",
      ],
    });

    return activities.map((activity) => this.convertActivityEntityToIActivity(activity));
  }
}
