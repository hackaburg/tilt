import { MockedService } from ".";
import { IUserService } from "../../../src/services/user";

export const MockUserService = jest.fn(() =>
  new MockedService<IUserService>({
    bootstrap: jest.fn(),
    signup: jest.fn(),
    verifyUserByVerifyToken: jest.fn(),
  }),
);
