import * as WebSocket from "ws";
import { MockedService } from ".";
import { IWebSocketService } from "../../../src/services/ws-service";

/**
 * A mocked websocket service.
 */
export const MockWebSocketService = jest.fn(
  () =>
    new MockedService<IWebSocketService>({
      bootstrap: jest.fn(),
      broadcast: jest.fn(),
      registerClient: jest.fn(),
    }),
);

/**
 * A mocked websocket.
 */
export const MockWebSocket = jest.fn(
  () =>
    new MockedService<WebSocket>({
      addEventListener: jest.fn(),
      close: jest.fn(),
      removeEventListener: jest.fn(),
      send: jest.fn(),
    } as any),
);
