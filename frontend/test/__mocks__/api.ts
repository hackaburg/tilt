import { ApiClient } from "../../src/api";
import { PublicFields } from "../../src/util";

type IMockedApi = {
  [K in keyof PublicFields<ApiClient>]: jest.Mock;
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
