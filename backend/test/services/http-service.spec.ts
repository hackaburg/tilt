import { User } from "../../src/entities/user";
import { UserRole } from "../../src/entities/user-role";
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
  listen: jest.Mock;
  get: jest.Mock;
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

describe("HttpService", () => {
  let routingControllers: IMockedRoutingControllers;
  let express: IMockedExpress;
  let expressUse: jest.Mock;
  let expressStatic: jest.Mock;
  let expressListen: jest.Mock;
  let expressGet: jest.Mock;

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
          publicDirectory: __dirname,
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
    (express as any).static = expressStatic = jest.fn();

    expressListen = jest.fn();
    expressUse = jest.fn();
    (expressGet = jest.fn()),
      express.mockImplementation(() => ({
        get: expressGet,
        listen: expressListen,
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
        [UserRole.User, UserRole.Root, false],
      ],
      [
        [UserRole.Moderator, UserRole.User, true],
        [UserRole.Moderator, UserRole.Moderator, true],
        [UserRole.Moderator, UserRole.Root, false],
      ],
      [
        [UserRole.Root, UserRole.User, true],
        [UserRole.Root, UserRole.Moderator, true],
        [UserRole.Root, UserRole.Root, true],
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

  it("serves static files", async () => {
    expect.assertions(2);
    await httpService.bootstrap();
    expect(expressStatic).toBeCalledWith(
      config.instance.config.http.publicDirectory,
      expect.anything(),
    );
    expect(expressGet).toBeCalled();
  });

  it("listens on the specified port", async () => {
    expect.assertions(1);
    await httpService.bootstrap();
    expect(expressListen).toBeCalledWith(config.instance.config.http.port);
  });
});
