import { UserRole } from "../../../types/roles";
import { IWebSocketMessage, WebSocketMessageType } from "../../../types/ws";
import { IWebSocketService, WebSocketService } from "../../src/services/ws-service";
import { MockWebSocket } from "./mock/mock-ws-service";

describe("WebSocketService", () => {
  let service: IWebSocketService;

  beforeEach(() => {
    service = new WebSocketService();
  });

  it("registers clients", () => {
    const role = UserRole.User;
    const socket = new MockWebSocket();
    service.registerClient(role, socket.instance);

    const message = "test" as any;
    service.broadcast(role, message);

    expect(socket.mocks.send).toBeCalled();
  });

  it("removes registered clients on close", () => {
    const role = UserRole.User;
    const socket = new MockWebSocket();

    let onCloseCallback: (() => any) | undefined;
    socket.mocks.on.mockImplementation((_event: string, callback: () => any) => onCloseCallback = callback);

    service.registerClient(role, socket.instance);

    expect(socket.mocks.on).toBeCalled();
    expect(onCloseCallback).toBeDefined();

    service.broadcast(role, "test" as any);
    expect(socket.mocks.send).toBeCalled();
    socket.mocks.send.mockReset();

    if (onCloseCallback) {
      onCloseCallback();
      service.broadcast(role, "test" as any);
      expect(socket.mocks.send).not.toBeCalled();
    }
  });

  it("expands the receiving audience", () => {
    const data = "test" as any;

    const ownerSocket = new MockWebSocket();
    service.registerClient(UserRole.Owner, ownerSocket.instance);

    const moderatorSocket = new MockWebSocket();
    service.registerClient(UserRole.Moderator, moderatorSocket.instance);

    const userSocket = new MockWebSocket();
    service.registerClient(UserRole.User, userSocket.instance);

    service.broadcast(UserRole.User, data);
    expect(userSocket.mocks.send).toBeCalled();
    expect(moderatorSocket.mocks.send).toBeCalled();
    expect(ownerSocket.mocks.send).toBeCalled();

    ownerSocket.mocks.send.mockReset();
    moderatorSocket.mocks.send.mockReset();
    userSocket.mocks.send.mockReset();

    service.broadcast(UserRole.Moderator, data);
    expect(userSocket.mocks.send).not.toBeCalled();
    expect(moderatorSocket.mocks.send).toBeCalled();
    expect(ownerSocket.mocks.send).toBeCalled();

    ownerSocket.mocks.send.mockReset();
    moderatorSocket.mocks.send.mockReset();
    userSocket.mocks.send.mockReset();

    service.broadcast(UserRole.Owner, data);
    expect(userSocket.mocks.send).not.toBeCalled();
    expect(moderatorSocket.mocks.send).not.toBeCalled();
    expect(ownerSocket.mocks.send).toBeCalled();
  });

  it("doesn't send to unknown roles", () => {
    const socket = new MockWebSocket();
    service.registerClient(UserRole.User, socket.instance);

    service.broadcast(null as any, "test" as any);
    expect(socket.mocks.send).not.toBeCalled();
  });

  it("wraps the data to send in an api response object", () => {
    const role = UserRole.User;
    const socket = new MockWebSocket();
    service.registerClient(role, socket.instance);

    const message: IWebSocketMessage = {
      data: {
        token: "test",
        type: WebSocketMessageType.Token,
      },
      status: "ok",
    };

    service.broadcast(role, message.data);

    const json = JSON.stringify(message);
    expect(socket.mocks.send).toBeCalledWith(json);
  });
});
