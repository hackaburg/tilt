import { Project } from "../../src/entities/project";
import { Team } from "../../src/entities/team";
import { User } from "../../src/entities/user";
import { TeamService, ITeamService } from "../../src/services/team-service";
import { TestDatabaseService } from "./mock/mock-database-service";
import { UserRole } from "../../src/entities/user-role";

describe("TeamService", () => {
  let teamService: ITeamService;
  let database: TestDatabaseService;

  beforeAll(async () => {
    database = new TestDatabaseService();
    await database.bootstrap();
  });

  beforeEach(async () => {
    await database.nuke();
    teamService = new TeamService(database);
    await teamService.bootstrap();
  });

  describe("createTeam", () => {
    it("creates a default project", async () => {
      const projectRepo = database.getRepository(Project);
      const userRepo = database.getRepository(User);
      expect(await projectRepo.count()).toEqual(0);

      const user = new User();
      user.firstName = "Regular";
      user.lastName = "User";
      user.email = "user@test.com";
      user.password = "";
      user.role = UserRole.User;
      user.verifyToken = "";
      user.tokenSecret = "";
      user.forgotPasswordToken = "";
      await userRepo.save(user);

      const team = new Team();
      team.title = "Team 1";
      team.users = [user];
      team.teamImg = "";
      team.description = "Team 1 description";
      team.requests = [];

      await teamService.createTeam(team);

      const projects = await projectRepo.find();
      expect(projects).toHaveLength(1);
      expect(projects[0].team.title).toEqual(team.title);
    });
  });
});
