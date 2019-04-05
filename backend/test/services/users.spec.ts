import { Repository } from "typeorm";
import { ActivityEvent } from "../../../types/activity";
import { User } from "../../src/entities/user";
import { IActivityService } from "../../src/services/activity";
import { IDatabaseService } from "../../src/services/database";
import { ILoggerService } from "../../src/services/log";
import { IUserService, UserService } from "../../src/services/user";
import { MockedService } from "./mock";
import { MockActivityService } from "./mock/activity";
import { TestDatabaseService } from "./mock/database";
import { MockLoggerService } from "./mock/logger";

describe("UserService", () => {
  let database: IDatabaseService;
  let userRepo: Repository<User>;
  let logger: MockedService<ILoggerService>;
  let activity: MockedService<IActivityService>;
  let userService: IUserService;

  beforeAll(async () => {
    database = new TestDatabaseService();
    await database.bootstrap();

    userRepo = database.getRepository(User);
  });

  beforeEach(async () => {
    await userRepo.clear();

    logger = new MockLoggerService();
    activity = new MockActivityService();
    userService = new UserService(database, logger.instance, activity.instance);

    await userService.bootstrap();
  });

  it("adds users", async () => {
    expect.assertions(1);

    await userService.signup("test@foo.bar", "password");
    const users = await userRepo.find();
    expect(users.length).toBe(1);
  });

  it("enforces unique emails on signup", async () => {
    expect.assertions(1);

    await userService.signup("test@foo.bar", "password");
    const promise = userService.signup("test@foo.bar", "password");
    await expect(promise).rejects.toBeDefined();
  });

  it("hashes user passwords", async () => {
    expect.assertions(1);

    const password = "password";
    await userService.signup("test@foo.bar", password);
    const [user] = await userRepo.find();
    expect(user.password).not.toEqual(password);
  });

  it("rejects incomplete signups", async () => {
    expect.assertions(2);

    const missingEmailPromise = userService.signup(undefined as any, "password");
    await expect(missingEmailPromise).rejects.toBeDefined();

    const missingPasswordPromise = userService.signup("test@foo.bar", undefined as any);
    await expect(missingPasswordPromise).rejects.toBeDefined();
  });

  it("adds signup events to the activity log", async () => {
    expect.assertions(1);

    const user = await userService.signup("test@foo.bar", "password");
    expect(activity.mocks.addActivity).toBeCalledWith(user, ActivityEvent.Signup);
  });

  it("verifies users using their token", async () => {
    expect.assertions(1);

    const { verifyToken } = await userService.signup("test@foo.bar", "password");
    await userService.verifyUserByVerifyToken(verifyToken);
    const [user] = await userRepo.find();
    expect(user.verifyToken).not.toEqual(verifyToken);
  });

  it("ignores invalid verification tokens", async () => {
    expect.assertions(1);

    await userService.signup("test@foo.bar", "password");
    const promise = userService.verifyUserByVerifyToken("verify me plz");
    await expect(promise).rejects.toBeDefined();
  });

  it("adds verification events to the activity log", async () => {
    expect.assertions(1);

    const user = await userService.signup("test@foo.bar", "password");
    activity.mocks.addActivity.mockReset();
    await userService.verifyUserByVerifyToken(user.verifyToken);
    const [verifiedUser] = await userRepo.find();
    expect(activity.mocks.addActivity).toBeCalledWith(verifiedUser, ActivityEvent.EmailVerified);
  });
});
