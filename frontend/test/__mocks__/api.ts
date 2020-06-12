import { IApi } from "../../src/api";

type IMockedApi = {
  [K in keyof IApi]: jest.Mock;
};

/**
 * A mocked api client.
 */
export const api: IMockedApi = {
  getSettings: jest.fn(),
  login: jest.fn(),
  refreshLoginToken: jest.fn(),
  signup: jest.fn(),
  updateSettings: jest.fn(),
  verifyEmail: jest.fn(),
};
