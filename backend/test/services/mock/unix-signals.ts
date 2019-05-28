import { MockedService } from ".";
import { IUnixSignalService } from "../../../src/services/unix-signals";

export const MockUnixSignalService = jest.fn(() => (
  new MockedService<IUnixSignalService>({
    bootstrap: jest.fn(),
    registerSignalHandler: jest.fn(),
  })
));
