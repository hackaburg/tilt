import { MockedService } from ".";
import { IUnixSignalService } from "../../../src/services/unix-signal-service";

/**
 * A mocked unix signal service.
 */
export const MockUnixSignalService = jest.fn(
  () =>
    new MockedService<IUnixSignalService>({
      bootstrap: jest.fn(),
      registerSignalHandler: jest.fn(),
    }),
);
