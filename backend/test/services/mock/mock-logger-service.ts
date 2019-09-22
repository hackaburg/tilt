import { MockedService } from ".";
import { ILoggerService } from "../../../src/services/logger-service";

/**
 * A mocked logger service.
 */
export const MockLoggerService = jest.fn(() =>
  new MockedService<ILoggerService>({
    bootstrap: jest.fn(),
    debug: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  }),
);
