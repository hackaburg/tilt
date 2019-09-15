import { MockedService } from ".";
import { IUserService } from "../../../src/services/user-service";

export const MockUserService = jest.fn(() =>
  new MockedService<IUserService>({
    bootstrap: jest.fn(),
    findUserByLoginToken: jest.fn(),
    findUserWithCredentials: jest.fn(),
    generateLoginToken: jest.fn(),
    signup: jest.fn(),
    verifyUserByVerifyToken: jest.fn(),
  }),
);
