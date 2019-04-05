import { MockedService } from ".";
import { ITokenService } from "../../../src/services/tokens";

export const MockTokenService = jest.fn(() =>
  new MockedService<ITokenService<any>>({
    bootstrap: jest.fn(),
    decode: jest.fn(),
    sign: jest.fn(),
  }),
);
