import { UserRole } from "../../../types/roles";
import { IWebSocketMessage, WebSocketMessageType } from "../../../types/ws";
import { User } from "../../src/entities/user";
import { IConfigurationService } from "../../src/services/config-service";
import { HttpService, IHttpService } from "../../src/services/http-service";
import { ILoggerService } from "../../src/services/logger-service";
import { IUserService } from "../../src/services/user-service";
import { IWebSocketService } from "../../src/services/ws-service";
import { MockedService } from "./mock";
import { MockConfigurationService } from "./mock/mock-config-service";
import { MockLoggerService } from "./mock/mock-logger-service";
import { MockUserService } from "./mock/mock-user-service";
import { MockWebSocket, MockWebSocketService } from "./mock/mock-ws-service";

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
  let ws: MockedService<IWebSocketService>;
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
    ws = new MockWebSocketService();
    httpService = new HttpService(
      config.instance,
      logger.instance,
      users.instance,
      ws.instance,
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

  it("registers sockets after authentication", async () => {
    expect.assertions(3);

    const socket = new MockWebSocket();
    let messageCallback: ((message: { data: string }) => any) | undefined;

    socket.mocks.addEventListener.mockImplementation(
      (_event: string, callback: any) => (messageCallback = callback),
    );
    httpService.setupWebSocketConnection(socket.instance);
    expect(messageCallback).toBeDefined();

    const user = {
      role: UserRole.User,
    };
    users.mocks.findUserByLoginToken.mockResolvedValue(user);

    const token = "token";
    const tokenMessage: IWebSocketMessage = {
      data: {
        token,
        type: WebSocketMessageType.Token,
      },
      status: "ok",
    };

    const json = JSON.stringify(tokenMessage);

    if (messageCallback) {
      await messageCallback({ data: json });
    }

    expect(socket.mocks.addEventListener).toBeCalledWith(
      "message",
      messageCallback,
    );
    expect(ws.mocks.registerClient).toBeCalledWith(user.role, socket.instance);
  });

  it("closes the socket for invalid tokens", async () => {
    expect.assertions(3);

    const socket = new MockWebSocket();
    let messageCallback: ((message: { data: string }) => any) | undefined;

    socket.mocks.addEventListener.mockImplementation(
      (_event: string, callback: any) => (messageCallback = callback),
    );
    httpService.setupWebSocketConnection(socket.instance);
    expect(messageCallback).toBeDefined();

    users.mocks.findUserByLoginToken.mockResolvedValue(undefined);

    const tokenMessage: IWebSocketMessage = {
      data: {
        token: "token",
        type: WebSocketMessageType.Token,
      },
      status: "ok",
    };

    const json = JSON.stringify(tokenMessage);

    if (messageCallback) {
      await messageCallback({ data: json });
    }

    expect(socket.mocks.close).toBeCalled();
    expect(ws.mocks.registerClient).not.toBeCalled();
  });

  it("ignores invalid message data from the websocket", async () => {
    expect.assertions(2);

    const socket = new MockWebSocket();
    let messageCallback: ((message: string) => any) | undefined;

    socket.mocks.addEventListener.mockImplementation(
      (_event: string, callback: any) => (messageCallback = callback),
    );
    httpService.setupWebSocketConnection(socket.instance);
    expect(messageCallback).toBeDefined();

    if (messageCallback) {
      await messageCallback("this is not json");
    }

    expect(ws.mocks.registerClient).not.toBeCalled();
  });

  it("drops stale websockets after 5s of not logging in", async () => {
    expect.assertions(1);

    const socket = new MockWebSocket();

    httpService.setupWebSocketConnection(socket.instance);
    jest.runAllTimers();

    expect(socket.mocks.close).toBeCalled();
  });
});
