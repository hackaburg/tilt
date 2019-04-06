import { User } from "../../src/entities/user";
import { IConfigurationService } from "../../src/services/config";
import { HttpService, IHttpService } from "../../src/services/http";
import { ILoggerService } from "../../src/services/log";
import { IUserService } from "../../src/services/user";
import { MockedService } from "./mock";
import { MockConfigurationService } from "./mock/config";
import { MockLoggerService } from "./mock/logger";
import { MockUserService } from "./mock/users";

describe("HttpService", () => {
  let config: MockedService<IConfigurationService>;
  let logger: MockedService<ILoggerService>;
  let users: MockedService<IUserService>;
  let httpService: IHttpService;

  beforeEach(() => {
    config = new MockConfigurationService({  });
    logger = new MockLoggerService();
    users = new MockUserService();
    httpService = new HttpService(config.instance, logger.instance, users.instance);
  });

  it("retrieves the current user from an access token", async () => {
    expect.assertions(2);

    const user = new User();
    users.mocks.findUserByLoginToken.mockResolvedValue(user);
    const currentUser = await httpService.getCurrentUser({
      request: {
        headers: {
          authorization: "Bearer token",
        },
      },
    } as any);

    expect(currentUser).toBeDefined();
    expect(currentUser).toBe(user);
  });

  it("expects 'Bearer token' login tokens", async () => {
    expect.assertions(3);

    const user = new User();
    users.mocks.findUserByLoginToken.mockResolvedValue(user);

    const token = "testtoken";
    const userWithValidToken = await httpService.getCurrentUser({
      request: {
        headers: {
          authorization: `Bearer ${token}`,
        },
      },
    } as any);

    expect(userWithValidToken).toBeDefined();
    expect(users.mocks.findUserByLoginToken).toBeCalledWith(token);

    const userWithInvalidToken = await httpService.getCurrentUser({
      request: {
        headers: {
          authorization: "Invalid Token",
        },
      },
    } as any);

    expect(userWithInvalidToken).not.toBeDefined();
  });
});
