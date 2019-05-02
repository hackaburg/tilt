import { MockedService } from ".";
import { IHttpService } from "../../../src/services/http";

export const MockHttpService = jest.fn(() =>
  new MockedService<IHttpService>({
    bootstrap: jest.fn(),
    getCurrentUser: jest.fn(),
    isActionAuthorized: jest.fn(),
    setupWebSocketConnection: jest.fn(),
  }),
);
