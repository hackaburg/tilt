import { Repository } from "typeorm";
import { NotFoundError } from "routing-controllers";
import { Project } from "../../src/entities/project";
import { Team } from "../../src/entities/team";
import { User } from "../../src/entities/user";
import { UserRole } from "../../src/entities/user-role";
import {
  IProjectService,
  ProjectService,
} from "../../src/services/project-service";
import { TestDatabaseService } from "./mock/mock-database-service";

describe("ProjectService", () => {
  let database: TestDatabaseService;
  let projectService: IProjectService;

  let userRepo: Repository<User>;
  let teamRepo: Repository<Team>;
  let projectRepo: Repository<Project>;

  let adminUser: User;
  let regularUser: User;
  let userWithoutTeam: User;
  let mockProject: Project;
  let mockTeam: Team;

  beforeAll(async () => {
    database = new TestDatabaseService();
    await database.bootstrap();
  });

  beforeEach(async () => {
    await database.nuke();

    userRepo = database.getRepository(User);
    teamRepo = database.getRepository(Team);
    projectRepo = database.getRepository(Project);

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

    // Create regular users
    regularUser = new User();
    regularUser.firstName = "Regular";
    regularUser.lastName = "User";
    regularUser.email = "user@test.com";
    regularUser.password = "";
    regularUser.role = UserRole.User;
    regularUser.verifyToken = "";
    regularUser.tokenSecret = "";
    regularUser.forgotPasswordToken = "";

    userWithoutTeam = new User();
    userWithoutTeam.firstName = "Regular 2";
    userWithoutTeam.lastName = "User 2";
    userWithoutTeam.email = "user2@test.com";
    userWithoutTeam.password = "";
    userWithoutTeam.role = UserRole.User;
    userWithoutTeam.verifyToken = "";
    userWithoutTeam.tokenSecret = "";
    userWithoutTeam.forgotPasswordToken = "";

    [adminUser, regularUser, userWithoutTeam] = await userRepo.save([
      adminUser,
      regularUser,
      userWithoutTeam,
    ]);

    mockTeam = new Team();
    mockTeam.title = "Team 1";
    mockTeam.users = [regularUser.id.toString()];
    mockTeam.teamImg = "";
    mockTeam.description = "";
    mockTeam.requests = [];
    mockTeam = await teamRepo.save(mockTeam);

    mockProject = new Project();
    mockProject.team = mockTeam;
    mockProject.title = "Original Title";
    mockProject.description = "Original Description";
    mockProject.allowRating = false;
    mockProject = await projectRepo.save(mockProject);

    projectService = new ProjectService(database);
    await projectService.bootstrap();
  });

  describe("checkPermission", () => {
    describe("via updateProject", () => {
      it("allows update when user is in the project team", async () => {
        expect.assertions(1);
        const updatedProject = Object.assign(new Project(), {
          ...mockProject,
          title: "New Title",
        });
        const result = await projectService.updateProject(
          updatedProject,
          regularUser,
        );
        expect(result.title).toBe("New Title");
      });

      it("regular users cannot overwrite allowRating", async () => {
        expect.assertions(1);
        const updatedProject = Object.assign(new Project(), {
          ...mockProject,
          allowRating: true,
        });
        const result = await projectService.updateProject(
          updatedProject,
          regularUser,
        );
        expect(result.allowRating).toEqual(false);
      });

      it("admins can overwrite allowRating", async () => {
        expect.assertions(1);
        const updatedProject = Object.assign(new Project(), {
          ...mockProject,
          allowRating: true,
        });
        const result = await projectService.updateProject(
          updatedProject,
          adminUser,
        );
        expect(result.allowRating).toEqual(true);
      });

      it("throws NotFoundError when user is not in the project team", async () => {
        expect.assertions(1);
        const updatedProject = Object.assign(new Project(), {
          ...mockProject,
          title: "New Title",
        });
        await expect(
          projectService.updateProject(updatedProject, userWithoutTeam),
        ).rejects.toThrow(NotFoundError);
      });

      it("throws NotFoundError when project does not exist", async () => {
        expect.assertions(1);
        await projectRepo.delete(mockProject.id);
        const updatedProject = Object.assign(new Project(), {
          ...mockProject,
          title: "New Title",
        });
        await expect(
          projectService.updateProject(updatedProject, regularUser),
        ).rejects.toThrow(NotFoundError);
      });
    });
  });
});
