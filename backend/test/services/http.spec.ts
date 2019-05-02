import { UserRole } from "../../../types/roles";
import { IWebSocketMessage, WebSocketMessageType } from "../../../types/ws";
import { User } from "../../src/entities/user";
import { IConfigurationService } from "../../src/services/config";
import { HttpService, IHttpService } from "../../src/services/http";
import { ILoggerService } from "../../src/services/log";
import { IUserService } from "../../src/services/user";
import { IWebSocketService } from "../../src/services/ws";
import { MockedService } from "./mock";
import { MockConfigurationService } from "./mock/config";
import { MockLoggerService } from "./mock/logger";
import { MockUserService } from "./mock/users";
import { MockWebSocket, MockWebSocketService } from "./mock/ws";

describe("HttpService", () => {
  let config: MockedService<IConfigurationService>;
  let logger: MockedService<ILoggerService>;
  let users: MockedService<IUserService>;
  let ws: MockedService<IWebSocketService>;
  let httpService: IHttpService;

  beforeEach(() => {
    config = new MockConfigurationService({  });
    logger = new MockLoggerService();
    users = new MockUserService();
    ws = new MockWebSocketService();
    httpService = new HttpService(config.instance, logger.instance, users.instance, ws.instance);
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

  it("registers sockets after authentication", async () => {
    expect.assertions(3);

    const socket = new MockWebSocket();
    let messageCallback: ((message: string) => any) | undefined;

    socket.mocks.on.mockImplementation((_event: string, callback: any) => messageCallback = callback);
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
      await messageCallback(json);
    }

    expect(socket.mocks.off).toBeCalledWith("message", messageCallback);
    expect(ws.mocks.registerClient).toBeCalledWith(user.role, socket.instance);
  });

  it("closes the socket for invalid tokens", async () => {
    expect.assertions(3);

    const socket = new MockWebSocket();
    let messageCallback: ((message: string) => any) | undefined;

    socket.mocks.on.mockImplementation((_event: string, callback: any) => messageCallback = callback);
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
      await messageCallback(json);
    }

    expect(socket.mocks.close).toBeCalled();
    expect(ws.mocks.registerClient).not.toBeCalled();
  });

  it("ignores invalid message data from the websocket", async () => {
    expect.assertions(2);

    const socket = new MockWebSocket();
    let messageCallback: ((message: string) => any) | undefined;

    socket.mocks.on.mockImplementation((_event: string, callback: any) => messageCallback = callback);
    httpService.setupWebSocketConnection(socket.instance);
    expect(messageCallback).toBeDefined();

    if (messageCallback) {
      await messageCallback("this is not json");
    }

    expect(ws.mocks.registerClient).not.toBeCalled();
  });
});
