import { Repository } from "typeorm";
import { ActivityEvent } from "../../../types/activity";
import { Activity } from "../../src/entities/activity";
import { User } from "../../src/entities/user";
import { ActivityService, IActivityService } from "../../src/services/activity";
import { IDatabaseService } from "../../src/services/database";
import { TestDatabaseService } from "./mock/database";

describe("ActivityService", () => {
  let database: IDatabaseService;
  let activities: Repository<Activity>;
  let activity: IActivityService;
  let user: User;

  beforeAll(async () => {
    database = new TestDatabaseService();
    await database.bootstrap();

    user = new User();
    user.email = "test@foo.bar";
    user.password = "password";
    user.createdAt = new Date();
    user.updatedAt = new Date();
    user.verifyToken = "token";
    await database.getRepository(User).save(user);

    activities = database.getRepository(Activity);
  });

  beforeEach(async () => {
    activity = new ActivityService(database);
    await activity.bootstrap();
  });

  afterEach(() => {
    activities.clear();
  });

  it("adds new activities", async () => {
    expect.assertions(2);

    const event = ActivityEvent.Signup;
    await activity.addActivity(user, event);

    const data = await activities.find();

    expect(data.length).toBe(1);
    expect(data[0].event).toBe(event);
  });

  it("retrieves all activities", async () => {
    expect.assertions(1);

    await activity.addActivity(user, ActivityEvent.EmailVerified);
    await activity.addActivity(user, ActivityEvent.Signup);

    const data = await activity.getActivities();
    expect(data.length).toBe(2);
  });
});
