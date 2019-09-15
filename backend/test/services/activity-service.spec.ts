import { Repository } from "typeorm";
import { ActivityType } from "../../../types/activity";
import { Activity } from "../../src/entities/activity";
import { User } from "../../src/entities/user";
import { ActivityService, IActivityService } from "../../src/services/activity-service";
import { IDatabaseService } from "../../src/services/database-service";
import { UserService } from "../../src/services/user-service";
import { TestDatabaseService } from "./mock/mock-database-service";
import { MockEmailTemplateService } from "./mock/mock-email-template-service";
import { MockHaveibeenpwnedService } from "./mock/mock-haveibeenpwned-service";
import { MockLoggerService } from "./mock/mock-logger-service";
import { MockTokenService } from "./mock/mock-token-service";

describe("ActivityService", () => {
  let database: IDatabaseService;
  let activities: Repository<Activity>;
  let activity: IActivityService;
  let user: User;

  beforeAll(async () => {
    database = new TestDatabaseService();
    await database.bootstrap();

    const users = new UserService(
      new MockHaveibeenpwnedService().instance,
      database,
      new MockLoggerService().instance,
      new MockTokenService().instance,
      new MockEmailTemplateService().instance,
    );
    await users.bootstrap();
    user = await users.signup("test@foo.bar", "password");

    activities = database.getRepository(Activity);
  });

  beforeEach(async () => {
    await activities.clear();
    activity = new ActivityService(database);
    await activity.bootstrap();
  });

  it("adds new activities", async () => {
    expect.assertions(2);

    const event = ActivityType.Signup;
    await activity.addActivity(user, {
      type: event,
    });

    const data = await activities.find();

    expect(data.length).toBe(1);
    expect(data[0].type).toBe(event);
  });

  it("retrieves all activities", async () => {
    expect.assertions(1);

    await activity.addActivity(user, {
      type: ActivityType.EmailVerified,
    });

    await activity.addActivity(user, {
      type: ActivityType.Signup,
    });

    const data = await activity.getActivities();
    expect(data.length).toBe(2);
  });
});
