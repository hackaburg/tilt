import { MockedService } from ".";
import { IPruneService } from "../../../src/services/prune-service";

/**
 * A mocked system prune service.
 */
export const MockPruneService = jest.fn(
  () =>
    new MockedService<IPruneService>({
      bootstrap: jest.fn(),
      prune: jest.fn(),
    }),
);
