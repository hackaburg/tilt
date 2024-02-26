import { MockedService } from ".";
import { ITeamService } from "../../../src/services/team-service";

/**
 * A mocked user service.
 */
export const MockTeamsService = jest.fn(
  () =>
    new MockedService<ITeamService>({
      bootstrap: jest.fn(),
      createTeam: jest.fn(),
      deleteTeamByID: jest.fn(),
      getAllTeams: jest.fn(),
      getTeamByID: jest.fn(),
      requestToJoinTeam: jest.fn(),
      updateTeam: jest.fn(),
      acceptUserToTeam: jest.fn(),
    }),
);
