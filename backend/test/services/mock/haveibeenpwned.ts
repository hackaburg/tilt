import { MockedService } from ".";
import { IHaveibeenpwnedService } from "../../../src/services/haveibeenpwned";

export const MockHaveibeenpwnedService = jest.fn(() => (
  new MockedService<IHaveibeenpwnedService>({
    bootstrap: jest.fn(),
    getPasswordUsedCount: jest.fn(),
  })
));
