import { UserRole } from "../../../types/roles";
import { User } from "../../src/entities/user";
import { IConfigurationService } from "../../src/services/config-service";
import { HttpService, IHttpService } from "../../src/services/http-service";
import { ILoggerService } from "../../src/services/logger-service";
import { IUserService } from "../../src/services/user-service";
import { MockedService } from "./mock";
import { MockConfigurationService } from "./mock/mock-config-service";
import { MockLoggerService } from "./mock/mock-logger-service";
import { MockUserService } from "./mock/mock-user-service";

interface IMockedRoutingControllers {
  useExpressServer: jest.Mock;
  useContainer: jest.Mock;
}

jest.mock(
  "routing-controllers",
  jest.fn(
    () =>
      ({
        useContainer: jest.fn(),
        useExpressServer: jest.fn(),
      } as IMockedRoutingControllers),
  ),
);

type IMockedExpress = jest.Mock<{
  use: jest.Mock;
}>;

// I heard you like jest.fn, so I put jest.fn inside jest.fn inside jest.fn inside jest.fn
jest.mock("cors");
jest.mock(
  "http",
  jest.fn(() => ({
    createServer: jest.fn(() => ({
      listen: jest.fn(),
    })),
  })),
);

jest.mock(
  "express",
  jest.fn(() => jest.fn()),
);
jest.mock(
  "express-ws",
  jest.fn(() =>
    jest.fn(() => ({
      app: {
        ws: jest.fn(),
      },
    })),
  ),
);

describe("HttpService", () => {
  let routingControllers: IMockedRoutingControllers;
  let express: IMockedExpress;
  let expressUse: jest.Mock;

  let config: MockedService<IConfigurationService>;
  let logger: MockedService<ILoggerService>;
  let users: MockedService<IUserService>;
  let httpService: IHttpService;

  beforeAll(() => {
    jest.useFakeTimers();

    routingControllers = require("routing-controllers");
    express = require("express");
  });

  beforeEach(() => {
    config = new MockConfigurationService({
      config: {
        http: {
          port: 3000,
        },
      },
      isProductionEnabled: false,
    } as any);
    logger = new MockLoggerService();
    users = new MockUserService();
    httpService = new HttpService(
      config.instance,
      logger.instance,
      users.instance,
    );

    routingControllers.useContainer.mockReset();
    routingControllers.useExpressServer.mockReset();

    express.mockReset();
    expressUse = jest.fn();
    express.mockImplementation(() => ({
      use: expressUse,
    }));
  });

  it("creates a routed express server", async () => {
    expect.assertions(2);
    await httpService.bootstrap();
    expect(routingControllers.useExpressServer).toBeCalled();
    expect(express).toBeCalled();
  });

  it("uses typedi", async () => {
    expect.assertions(1);
    await httpService.bootstrap();
    expect(routingControllers.useContainer).toBeCalled();
  });

  it("uses cors during development", async () => {
    expect.assertions(1);
    await httpService.bootstrap();
    expect(expressUse).toBeCalled();
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
        const result = await httpService.isActionAuthorized(action, [
          expected as UserRole,
        ]);
        expect(result).toBe(value);
      }
    }
  });
});
