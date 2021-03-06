import { MockedService } from ".";
import { IHttpService } from "../../../src/services/http-service";

/**
 * A mocked http service.
 */
export const MockHttpService = jest.fn(
  () =>
    new MockedService<IHttpService>({
      bootstrap: jest.fn(),
      getCurrentUser: jest.fn(),
      isActionAuthorized: jest.fn(),
    }),
);
