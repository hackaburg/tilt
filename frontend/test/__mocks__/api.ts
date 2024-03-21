import { ApiClient } from "../../src/api";
import { PublicFields } from "../../src/util";

type IMockedApi = {
  [K in keyof PublicFields<ApiClient>]: jest.Mock;
};

/**
 * A mocked api client.
 */
export const api: IMockedApi = {
  admit: jest.fn(),
  checkIn: jest.fn(),
  declineSpot: jest.fn(),
  deleteUser: jest.fn(),
  getAllApplications: jest.fn(),
  getConfirmationForm: jest.fn(),
  getProfileForm: jest.fn(),
  getSettings: jest.fn(),
  login: jest.fn(),
  pruneSystem: jest.fn(),
  refreshLoginToken: jest.fn(),
  signup: jest.fn(),
  storeConfirmationFormAnswers: jest.fn(),
  storeProfileFormAnswers: jest.fn(),
  updateSettings: jest.fn(),
  verifyEmail: jest.fn(),
  forgotPassword: jest.fn(),
  resetPassword: jest.fn(),
  createTeam: jest.fn(),
  updateTeam: jest.fn(),
  requestToJoinTeam: jest.fn(),
  acceptUserToTeam: jest.fn(),
  deleteTeam: jest.fn(),
  getAllTeams: jest.fn(),
  getTeamByID: jest.fn(),
  getAllUsers: jest.fn(),
};
