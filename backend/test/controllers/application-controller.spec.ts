import { classToPlain } from "class-transformer";
import { ApplicationController } from "../../src/controllers/application-controller";
import { Team } from "../../src/entities/team";
import { User } from "../../src/entities/user";
import { UserRole } from "../../src/entities/user-role";
import { IApplicationService } from "../../src/services/application-service";
import { ITeamService } from "../../src/services/team-service";
import { IUserService } from "../../src/services/user-service";
import { MockedService } from "../services/mock";
import { MockApplicationService } from "../services/mock/mock-application-service";
import { MockTeamsService } from "../services/mock/mock-teams-service";
import { MockUserService } from "../services/mock/mock-user-service";

describe("ApplicationController", () => {
  let applicationService: MockedService<IApplicationService>;
  let userService: MockedService<IUserService>;
  let teamService: MockedService<ITeamService>;
  let controller: ApplicationController;

  beforeEach(() => {
    applicationService = new MockApplicationService();
    userService = new MockUserService();
    teamService = new MockTeamsService();
    controller = new ApplicationController(
      applicationService.instance,
      userService.instance,
      teamService.instance,
    );
  });

  describe("getAllTeams", () => {
    it("does not expose member email addresses", async () => {
      expect.assertions(2);

      const member = Object.assign(new User(), {
        id: 1,
        firstName: "Jane",
        lastName: "Doe",
        email: "jane@example.com",
        role: UserRole.User,
        password: "",
        verifyToken: "",
        tokenSecret: "",
        forgotPasswordToken: "",
        team: null,
        teamRequest: null,
      });

      const mockTeam = Object.assign(new Team(), {
        id: 1,
        title: "Test Team",
        teamImg: "",
        description: "A team",
        owner: member,
        users: [member],
        requests: [],
      });

      teamService.mocks.getAllTeams.mockResolvedValue([mockTeam]);

      const teams = await controller.getAllTeams();

      // Simulate the ResponseInterceptor which serializes with excludeAll
      const serialized = classToPlain(teams, {
        strategy: "excludeAll",
      }) as any[];

      expect(serialized).toHaveLength(1);
      expect(serialized[0].users[0]).not.toHaveProperty("email");
    });
  });
});
