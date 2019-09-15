import { MockedService } from ".";
import { ITokenService } from "../../../src/services/token-service";

export const MockTokenService = jest.fn(() =>
  new MockedService<ITokenService<any>>({
    bootstrap: jest.fn(),
    decode: jest.fn(),
    sign: jest.fn(),
  }),
);
