import { Repository } from "typeorm";
import { User } from "../../src/entities/user";
import { IDatabaseService } from "../../src/services/database";
import { IEmailTemplateService } from "../../src/services/email-template";
import { IHaveibeenpwnedService } from "../../src/services/haveibeenpwned";
import { ILoggerService } from "../../src/services/log";
import { ITokenService } from "../../src/services/tokens";
import { IUserService, UserService } from "../../src/services/user";
import { MockedService } from "./mock";
import { TestDatabaseService } from "./mock/database";
import { MockEmailTemplateService } from "./mock/email-template";
import { MockHaveibeenpwnedService } from "./mock/haveibeenpwned";
import { MockLoggerService } from "./mock/logger";
import { MockTokenService } from "./mock/tokens";

describe("UserService", () => {
  let database: IDatabaseService;
  let userRepo: Repository<User>;
  let logger: MockedService<ILoggerService>;
  let tokens: MockedService<ITokenService<any>>;
  let haveibeenpwned: MockedService<IHaveibeenpwnedService>;
  let emailTemplates: MockedService<IEmailTemplateService>;
  let userService: IUserService;

  beforeAll(async () => {
    database = new TestDatabaseService();
    await database.bootstrap();

    userRepo = database.getRepository(User);
  });

  beforeEach(async () => {
    await userRepo.clear();

    logger = new MockLoggerService();
    tokens = new MockTokenService();
    haveibeenpwned = new MockHaveibeenpwnedService();
    emailTemplates = new MockEmailTemplateService();
    userService = new UserService(
      haveibeenpwned.instance,
      database,
      logger.instance,
      tokens.instance,
      emailTemplates.instance,
    );

    await userService.bootstrap();
  });

  it("adds users", async () => {
    expect.assertions(1);

    await userService.signup("test@foo.bar", "password");
    const users = await userRepo.find();
    expect(users.length).toBe(1);
  });

  it("enforces unique emails on signup", async () => {
    expect.assertions(2);

    const email = "test@foo.bar";
    const password = "password";
    const existingUser = await userService.signup(email, password);

    const unverifiedPromise = userService.signup(email, password);
    await expect(unverifiedPromise).resolves.toBeDefined();

    await userService.verifyUserByVerifyToken(existingUser.verifyToken);
    const verifiedPromise = userService.signup(email, password);
    await expect(verifiedPromise).rejects.toBeDefined();
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

  it("sends a 'verify your email address' email", async () => {
    expect.assertions(1);

    await userService.signup("test@foo.bar", "password");
    expect(emailTemplates.mocks.sendVerifyEmail).toHaveBeenCalled();
  });

  it("doesn't sign up users twice if they didn't verify their email address", async () => {
    expect.assertions(1);

    const email = "test@foo.bar";
    const password = "password";
    await userService.signup(email, password);
    await userService.signup(email, password);

    const users = await userRepo.find();
    expect(users).toHaveLength(1);
  });

  it("resends the verification email", async () => {
    expect.assertions(1);

    const email = "test@foo.bar";
    const password = "password";
    await userService.signup(email, password);
    await userService.signup(email, password);

    expect(emailTemplates.mocks.sendVerifyEmail).toHaveBeenCalledTimes(2);
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

  it("creates login tokens", async () => {
    expect.assertions(1);

    const user = await userService.signup("test@foo.bar", "password");
    userService.generateLoginToken(user);
    expect(tokens.mocks.sign).toBeCalled();
  });

  it("decodes login tokens", async () => {
    expect.assertions(3);

    const user = await userService.signup("test@foo.bar", "password");
    tokens.mocks.decode.mockReturnValue({
      id: user.id,
    });
    const token = "token";
    const foundUser = await userService.findUserByLoginToken(token);

    expect(tokens.mocks.decode).toBeCalledWith(token);
    expect(foundUser).toBeDefined();
    expect(foundUser!.id).toBe(user.id);
  });

  it("returns no user for invalid login tokens", async () => {
    expect.assertions(1);

    tokens.mocks.decode.mockImplementation(() => { throw new Error("invalid token"); });
    const user = await userService.findUserByLoginToken("token");
    expect(user).not.toBeDefined();
  });

  it("finds users with correct credentials", async () => {
    expect.assertions(2);

    const email = "test@foo.bar";
    const password = "password";
    const user = await userService.signup(email, password);
    const loggedInUser = await userService.findUserWithCredentials(email, password);

    expect(loggedInUser).toBeDefined();
    expect(loggedInUser!.id).toBe(user.id);
  });

  it("won't return a user with wrong credentials", async () => {
    expect.assertions(2);

    const email = "test@foo.bar";
    const password = "password";
    await userService.signup(email, password);

    const userWithWrongPassword = await userService.findUserWithCredentials(email, "nope");
    expect(userWithWrongPassword).not.toBeDefined();

    const userWithWrongEmail = await userService.findUserWithCredentials("other@foo.bar", password);
    expect(userWithWrongEmail).not.toBeDefined();
  });

  it("fetches the user role for correct credentials", async () => {
    expect.assertions(1);

    const email = "test@foo.bar";
    const password = "password";
    await userService.signup(email, password);

    const loggedInUser = await userService.findUserWithCredentials(email, password);
    expect(loggedInUser!.role).toBeDefined();
  });

  it("checks for passwords in haveibeenpwned.com", async () => {
    expect.assertions(2);

    const password = "password";
    haveibeenpwned.mocks.getPasswordUsedCount.mockResolvedValue(0);
    await userService.signup("test@foo.bar", password);
    expect(haveibeenpwned.mocks.getPasswordUsedCount).toHaveBeenCalledWith(password);

    haveibeenpwned.mocks.getPasswordUsedCount.mockResolvedValue(1337);
    const promise = userService.signup("test@foo.bar", password);
    expect(promise).rejects.toBeDefined();
  });
});
