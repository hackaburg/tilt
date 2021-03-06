import { MockedService } from ".";
import { IHaveibeenpwnedService } from "../../../src/services/haveibeenpwned-service";

/**
 * A mocked haveibeenpwned service.
 */
export const MockHaveibeenpwnedService = jest.fn(
  () =>
    new MockedService<IHaveibeenpwnedService>({
      bootstrap: jest.fn(),
      getPasswordUsedCount: jest.fn(),
    }),
);
