import { NotFoundError } from "routing-controllers";
import { Project } from "../../src/entities/project";
import { Team } from "../../src/entities/team";
import { User } from "../../src/entities/user";
import { IDatabaseService } from "../../src/services/database-service";
import { IProjectService, ProjectService } from "../../src/services/project-service";
import { MockedService } from "./mock";

describe("ProjectService", () => {
  let mockProjectsRepo: any;
  let mockTeamsRepo: any;
  let mockUsersRepo: any;
  let mockDatabase: IDatabaseService;
  let projectService: IProjectService;

  const mockUser = Object.assign(new User(), { id: 1, role: "user" });
  const mockTeam = Object.assign(new Team(), { id: 10, users: ["1", "2"] });
  const mockProject = Object.assign(new Project(), {
    id: 100,
    team: mockTeam,
    title: "Original Title",
    description: "Original Description",
    allowRating: true,
  });

  beforeEach(async () => {
    mockProjectsRepo = {
      findOneBy: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      find: jest.fn(),
    };
    mockTeamsRepo = { findOneBy: jest.fn() };
    mockUsersRepo = { findOneBy: jest.fn() };

    mockDatabase = {
      bootstrap: jest.fn(),
      getRepository: jest.fn().mockImplementation((entity: any) => {
        if (entity === Project) return mockProjectsRepo;
        if (entity === Team) return mockTeamsRepo;
        if (entity === User) return mockUsersRepo;
        return { find: jest.fn().mockResolvedValue([]) };
      }),
    } as any;

    projectService = new ProjectService(mockDatabase);
    await projectService.bootstrap();
  });

  describe("checkPermission", () => {
    describe("via updateProject", () => {
      it("allows update when user is in the project team", async () => {
        expect.assertions(1);

        mockProjectsRepo.findOneBy.mockResolvedValue(mockProject);
        mockTeamsRepo.findOneBy.mockResolvedValue(mockTeam);
        const updatedProject = Object.assign(new Project(), { ...mockProject, title: "New Title" });
        mockProjectsRepo.save.mockResolvedValue(updatedProject);

        const result = await projectService.updateProject(mockProject, mockUser);

        expect(result.title).toBe("New Title");
      });

      it("throws NotFoundError when user is not in the project team", async () => {
        expect.assertions(1);

        mockProjectsRepo.findOneBy.mockResolvedValue(mockProject);
        mockTeamsRepo.findOneBy.mockResolvedValue(
          Object.assign(new Team(), { ...mockTeam, users: ["2", "3"] }),
        );

        await expect(projectService.updateProject(mockProject, mockUser)).rejects.toThrow(
          NotFoundError,
        );
      });

      it("throws NotFoundError when team does not exist", async () => {
        expect.assertions(1);

        mockProjectsRepo.findOneBy.mockResolvedValue(mockProject);
        mockTeamsRepo.findOneBy.mockResolvedValue(null);

        await expect(projectService.updateProject(mockProject, mockUser)).rejects.toThrow(
          NotFoundError,
        );
      });

      it("throws NotFoundError when project does not exist", async () => {
        expect.assertions(1);

        mockProjectsRepo.findOneBy.mockResolvedValue(null);

        await expect(projectService.updateProject(mockProject, mockUser)).rejects.toThrow(
          NotFoundError,
        );
      });
    });
  });
});
