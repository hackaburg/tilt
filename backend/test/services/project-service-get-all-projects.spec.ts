import { Project } from "../../src/entities/project";
import { Team } from "../../src/entities/team";
import { User } from "../../src/entities/user";
import { Settings } from "../../src/entities/settings";
import { UserRole } from "../../src/entities/user-role";
import {
  IProjectService,
  ProjectService,
} from "../../src/services/project-service";
import { TestDatabaseService } from "./mock/mock-database-service";
import { defaultSettings } from "./mock/mock-settings-service";

describe(ProjectService.name, () => {
  let service: IProjectService;
  let database: TestDatabaseService;
  let adminUser: User;
  let regularUser: User;

  beforeAll(async () => {
    database = new TestDatabaseService();
    await database.bootstrap();
  });

  beforeEach(async () => {
    await database.nuke();

    service = new ProjectService(database);
    await service.bootstrap();

    // Create admin user
    adminUser = new User();
    adminUser.firstName = "Admin";
    adminUser.lastName = "User";
    adminUser.email = "admin@test.com";
    adminUser.password = "";
    adminUser.role = UserRole.Root;
    adminUser.verifyToken = "";
    adminUser.tokenSecret = "";
    adminUser.forgotPasswordToken = "";

    // Create regular user
    regularUser = new User();
    regularUser.firstName = "Regular";
    regularUser.lastName = "User";
    regularUser.email = "user@test.com";
    regularUser.password = "";
    regularUser.role = UserRole.User;
    regularUser.verifyToken = "";
    regularUser.tokenSecret = "";
    regularUser.forgotPasswordToken = "";

    const userRepo = database.getRepository(User);
    await userRepo.save([adminUser, regularUser]);

    const settingsRepo = database.getRepository(Settings);
    await settingsRepo.save([
      {
        ...defaultSettings,
        application: {
          ...defaultSettings.application,
          allowRatingProjects: false,
        },
      },
    ]);
  });

  /**
   * Update the default settings from beforeEach with a different value for
   * allowRatingProjects
   */
  const allowRatingProjects = async (value: boolean): Promise<void> => {
    const settingsRepo = database.getRepository(Settings);
    const settings = {
      application: {
        allowRatingProjects: value,
      },
    };

    const [savedSettings] = await settingsRepo.find();
    const merged = settingsRepo.merge(savedSettings, settings);
    await settingsRepo.save(merged);
  };

  describe("getAllProjects", () => {
    it("gets all projects if the user is an admin", async () => {
      expect.assertions(4);

      // Create teams with projects
      const team1 = new Team();
      team1.title = "Team 1";
      team1.users = [regularUser.id];
      team1.image = "";
      team1.description = "";
      team1.requests = [];

      const team2 = new Team();
      team2.title = "Team 2";
      team2.users = [regularUser.id];
      team2.image = "";
      team2.description = "";
      team2.requests = [];

      const teamRepo = database.getRepository(Team);
      const savedTeams = await teamRepo.save([team1, team2]);

      // Create projects for teams (including those not assigned to admin)
      const project1 = new Project();
      project1.team = savedTeams[0];
      project1.title = "Project 1";
      project1.description = "Description 1";
      project1.allowRating = true;

      const project2 = new Project();
      project2.team = savedTeams[1];
      project2.title = "Project 2";
      project2.description = "Description 2";
      project2.allowRating = false;

      const project3 = new Project();
      project3.team = savedTeams[0];
      project3.title = "Project 3";
      project3.description = "Description 3";
      project3.allowRating = true;

      const projectRepo = database.getRepository(Project);
      await projectRepo.save([project1, project2, project3]);

      const allProjects = await service.getAllProjects(adminUser);

      expect(allProjects).toHaveLength(3);
      expect(allProjects[0]).toEqual(project1);
      expect(allProjects[1]).toEqual(project2);
      expect(allProjects[2]).toEqual(project3);
    });

    it("gets no projects if the user is a regular user", async () => {
      expect.assertions(1);

      // Create a team and project that the regular user is not part of
      const team = new Team();
      team.title = "Other Team";
      team.users = []; // Regular user is not part of this team
      team.teamImg = "";
      team.description = "";
      team.requests = [];

      const teamRepo = database.getRepository(Team);
      const savedTeam = await teamRepo.save(team);

      const project = new Project();
      project.team = savedTeam;
      project.title = "Project";
      project.description = "Description";
      project.allowRating = true;

      const projectRepo = database.getRepository(Project);
      await projectRepo.save(project);

      const allProjects = await service.getAllProjects(regularUser);

      expect(allProjects).toHaveLength(0);
    });

    it("regular user, part of two teams, gets 3 projects", async () => {
      expect.assertions(4);

      // Create two teams with the regular user
      const team1 = new Team();
      team1.title = "Team 1";
      team1.users = [regularUser.id];
      team1.image = "";
      team1.description = "";
      team1.requests = [];

      const team2 = new Team();
      team2.title = "Team 2";
      team2.users = [regularUser.id];
      team2.image = "";
      team2.description = "";
      team2.requests = [];

      const teamRepo = database.getRepository(Team);
      const savedTeams = await teamRepo.save([team1, team2]);

      // Create 2 projects for team1 and 1 project for team2
      const project1 = new Project();
      project1.team = savedTeams[0];
      project1.title = "Project 1 - Team 1";
      project1.description = "Description 1";
      project1.allowRating = true;

      const project2 = new Project();
      project2.team = savedTeams[0];
      project2.title = "Project 2 - Team 1";
      project2.description = "Description 2";
      project2.allowRating = false;

      const project3 = new Project();
      project3.team = savedTeams[1];
      project3.title = "Project 1 - Team 2";
      project3.description = "Description 3";
      project3.allowRating = true;

      const projectRepo = database.getRepository(Project);
      await projectRepo.save([project1, project2, project3]);

      const allProjects = await service.getAllProjects(regularUser);

      expect(allProjects).toHaveLength(3);
      expect(allProjects[0]).toEqual(project1);
      expect(allProjects[1]).toEqual(project2);
      expect(allProjects[2]).toEqual(project3);
    });

    it("regular user without team gets projects that can be rated", async () => {
      expect.assertions(2);

      await allowRatingProjects(true);

      // Create a team with no users
      const team = new Team();
      team.title = "Public Team";
      team.users = [];
      team.teamImg = "";
      team.description = "";
      team.requests = [];

      const teamRepo = database.getRepository(Team);
      const savedTeam = await teamRepo.save(team);

      // Create projects with different allowRating settings
      const ratingProject = new Project();
      ratingProject.team = savedTeam;
      ratingProject.title = "Project with Rating";
      ratingProject.description = "Description 1";
      ratingProject.allowRating = true;

      const noRatingProject = new Project();
      noRatingProject.team = savedTeam;
      noRatingProject.title = "Project without Rating";
      noRatingProject.description = "Description 2";
      noRatingProject.allowRating = false;

      const projectRepo = database.getRepository(Project);
      await projectRepo.save([ratingProject, noRatingProject]);

      const allProjects = await service.getAllProjects(regularUser);

      expect(allProjects).toHaveLength(1);
      expect(allProjects[0]).toEqual(ratingProject);
    });
  });
});
