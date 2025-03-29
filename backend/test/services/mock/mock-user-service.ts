import { MockedService } from ".";
import { IUserService } from "../../../src/services/user-service";

/**
 * A mocked user service.
 */
export const MockUserService = jest.fn(
  () =>
    new MockedService<IUserService>({
      bootstrap: jest.fn(),
      deleteUser: jest.fn(),
      findAll: jest.fn(),
      findUserByLoginToken: jest.fn(),
      findUserWithCredentials: jest.fn(),
      findUsersByIDs: jest.fn(),
      generateLoginToken: jest.fn(),
      signup: jest.fn(),
      updateUser: jest.fn(),
      updateUsers: jest.fn(),
      verifyUserByVerifyToken: jest.fn(),
      verifyUserResetPassword: jest.fn(),
      forgotPassword: jest.fn(),
      getUser: jest.fn(),
      getAllUsers: jest.fn(),
    }),
);
