import { User } from "../../src/entities/user";
import { IConfigurationService } from "../../src/services/config";
import { HttpService, IHttpService } from "../../src/services/http";
import { ILoggerService } from "../../src/services/log";
import { IUserService } from "../../src/services/user";
import { MockedService } from "./mock";
import { MockConfigurationService } from "./mock/config";
import { MockLoggerService } from "./mock/logger";
import { MockUserService } from "./mock/users";
import { UserRole } from "../../../types/roles";

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

  it("checks authorization correctly", async () => {
    expect.assertions(9);

    const user = new User();
    users.mocks.findUserByLoginToken.mockResolvedValue(user);

    const action: any = {
      request: {
        headers: {
          authorization: "Bearer token",
        },
      },
    };

    const table = [
      [
        [UserRole.User, UserRole.User, true],
        [UserRole.User, UserRole.Moderator, false],
        [UserRole.User, UserRole.Owner, false],
      ],
      [
        [UserRole.Moderator, UserRole.User, true],
        [UserRole.Moderator, UserRole.Moderator, true],
        [UserRole.Moderator, UserRole.Owner, false],
      ],
      [
        [UserRole.Owner, UserRole.User, true],
        [UserRole.Owner, UserRole.Moderator, true],
        [UserRole.Owner, UserRole.Owner, true],
      ],
    ];

    for (const row of table) {
      for (const [actual, expected, value] of row) {
        user.role = actual as UserRole;
        const result = await httpService.isActionAuthorized(action, [expected as UserRole]);
        expect(result).toBe(value);
      }
    }
  });
});
