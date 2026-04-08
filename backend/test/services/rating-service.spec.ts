import { ForbiddenError, NotFoundError } from "routing-controllers";
import { Repository } from "typeorm";
import { Criterion } from "../../src/entities/criterion";
import { Project } from "../../src/entities/project";
import { Rating } from "../../src/entities/rating";
import { Team } from "../../src/entities/team";
import { User } from "../../src/entities/user";
import { UserRole } from "../../src/entities/user-role";
import {
  IRatingService,
  RatingService,
} from "../../src/services/rating-service";
import { ISettingsService } from "../../src/services/settings-service";
import { MockedService } from "./mock";
import { MockSettingsService } from "./mock/mock-settings-service";
import { TestDatabaseService } from "./mock/mock-database-service";

describe("RatingService", () => {
  let database: TestDatabaseService;
  let settingsService: MockedService<ISettingsService>;
  let ratingService: IRatingService;

  let userRepo: Repository<User>;
  let teamRepo: Repository<Team>;
  let projectRepo: Repository<Project>;
  let criterionRepo: Repository<Criterion>;
  let ratingRepo: Repository<Rating>;

  let ratingUser: User;
  let teamMember: User;
  let mockTeam: Team;
  let mockProject: Project;
  let mockCriterion: Criterion;

  beforeAll(async () => {
    database = new TestDatabaseService();
    await database.bootstrap();
  });

  beforeEach(async () => {
    await database.nuke();

    settingsService = new MockSettingsService();

    userRepo = database.getRepository(User);
    teamRepo = database.getRepository(Team);
    projectRepo = database.getRepository(Project);
    criterionRepo = database.getRepository(Criterion);
    ratingRepo = database.getRepository(Rating);

    // A user who will submit ratings (not in the project's team)
    ratingUser = new User();
    ratingUser.firstName = "Rater";
    ratingUser.lastName = "User";
    ratingUser.email = "rater@test.com";
    ratingUser.password = "";
    ratingUser.role = UserRole.User;
    ratingUser.verifyToken = "";
    ratingUser.tokenSecret = "";
    ratingUser.forgotPasswordToken = "";
    ratingUser.admitted = true;

    // A user who is a member of the project team
    teamMember = new User();
    teamMember.firstName = "Team";
    teamMember.lastName = "Member";
    teamMember.email = "member@test.com";
    teamMember.password = "";
    teamMember.role = UserRole.User;
    teamMember.verifyToken = "";
    teamMember.tokenSecret = "";
    teamMember.forgotPasswordToken = "";
    teamMember.admitted = true;

    [ratingUser, teamMember] = await userRepo.save([ratingUser, teamMember]);

    mockTeam = new Team();
    mockTeam.title = "Test Team";
    mockTeam.users = [teamMember.id.toString()];
    mockTeam.teamImg = "";
    mockTeam.description = "";
    mockTeam.requests = [];
    mockTeam = await teamRepo.save(mockTeam);

    mockProject = new Project();
    mockProject.team = mockTeam;
    mockProject.title = "Test Project";
    mockProject.description = "";
    mockProject.allowRating = true;
    mockProject = await projectRepo.save(mockProject);

    mockCriterion = new Criterion();
    mockCriterion.title = "Test Criterion";
    mockCriterion.description = "";
    mockCriterion = await criterionRepo.save(mockCriterion);

    ratingService = new RatingService(database, settingsService.instance);
    await ratingService.bootstrap();
  });

  describe("checkPermission", () => {
    describe("via upsertRating", () => {
      it("throws ForbiddenError if user is not admitted", async () => {
        expect.assertions(1);

        ratingUser.admitted = false;

        const rating = Object.assign(new Rating(), {
          project: mockProject,
          user: ratingUser,
          criterion: mockCriterion,
          rating: 3,
        });

        await expect(
          ratingService.upsertRating(rating, ratingUser),
        ).rejects.toThrow(ForbiddenError);
      });

      it("throws ForbiddenError when rating is globally disabled", async () => {
        expect.assertions(1);

        settingsService.mocks.getSettings.mockResolvedValue({
          application: { allowRatingProjects: false },
        } as any);

        const rating = Object.assign(new Rating(), {
          project: mockProject,
          user: ratingUser,
          criterion: mockCriterion,
          rating: 3,
        });

        await expect(
          ratingService.upsertRating(rating, ratingUser),
        ).rejects.toThrow(ForbiddenError);
      });

      it("throws NotFoundError when project does not exist", async () => {
        expect.assertions(1);

        settingsService.mocks.getSettings.mockResolvedValue({
          application: { allowRatingProjects: true },
        } as any);

        const rating = Object.assign(new Rating(), {
          project: { id: 99999 },
          user: ratingUser,
          criterion: mockCriterion,
          rating: 3,
        });

        await expect(
          ratingService.upsertRating(rating, ratingUser),
        ).rejects.toThrow(NotFoundError);
      });

      it("throws ForbiddenError when project disallows rating", async () => {
        expect.assertions(1);

        settingsService.mocks.getSettings.mockResolvedValue({
          application: { allowRatingProjects: true },
        } as any);

        await projectRepo.update(mockProject.id, { allowRating: false });

        // The backend should not be tricked by an allowRating: true in the payload
        const rating = Object.assign(new Rating(), {
          project: { ...mockProject, allowRating: true },
          user: ratingUser,
          criterion: mockCriterion,
          rating: 3,
        });

        await expect(
          ratingService.upsertRating(rating, ratingUser),
        ).rejects.toThrow(ForbiddenError);
      });

      it("throws ForbiddenError when a user tries to rate their own project", async () => {
        expect.assertions(1);

        settingsService.mocks.getSettings.mockResolvedValue({
          application: { allowRatingProjects: true },
        } as any);

        const rating = Object.assign(new Rating(), {
          project: mockProject,
          user: teamMember,
          criterion: mockCriterion,
          rating: 3,
        });

        await expect(
          ratingService.upsertRating(rating, teamMember),
        ).rejects.toThrow(ForbiddenError);
      });

      it("creates a rating when all permissions are satisfied", async () => {
        expect.assertions(2);

        settingsService.mocks.getSettings.mockResolvedValue({
          application: { allowRatingProjects: true },
        } as any);

        const rating = Object.assign(new Rating(), {
          project: mockProject,
          user: ratingUser,
          criterion: mockCriterion,
          rating: 4,
        });

        const result = await ratingService.upsertRating(rating, ratingUser);

        expect(result.id).toBeDefined();
        expect(result.rating).toBe(4);
      });

      it("is forbidden to impersonate other users", async () => {
        expect.assertions(1);

        settingsService.mocks.getSettings.mockResolvedValue({
          application: { allowRatingProjects: true },
        } as any);

        const rating = Object.assign(new Rating(), {
          project: mockProject,
          user: { ...ratingUser, id: teamMember.id },
          criterion: mockCriterion,
          rating: 3,
        });

        await expect(
          ratingService.upsertRating(rating, ratingUser),
        ).rejects.toThrow(ForbiddenError);
      });
    });
  });

  describe("getRatingResults", () => {
    it("aggregates ratings for two projects with two ratings each", async () => {
      expect.assertions(6);

      const projectA = await projectRepo.save(
        Object.assign(new Project(), {
          team: mockTeam,
          title: "Project A",
          description: "",
          allowRating: true,
        }),
      );
      const projectB = await projectRepo.save(
        Object.assign(new Project(), {
          team: mockTeam,
          title: "Project B",
          description: "",
          allowRating: true,
        }),
      );

      const criterionA = await criterionRepo.save(
        Object.assign(new Criterion(), {
          title: "Criterion A",
          description: "",
        }),
      );
      const criterionB = await criterionRepo.save(
        Object.assign(new Criterion(), {
          title: "Criterion B",
          description: "",
        }),
      );

      // Create extra users to submit ratings (not team members)
      const [raterA, raterB, raterC] = await userRepo.save([
        Object.assign(new User(), {
          firstName: "A",
          lastName: "R",
          email: "ra@test.com",
          password: "",
          role: UserRole.User,
          verifyToken: "",
          tokenSecret: "",
          forgotPasswordToken: "",
        }),
        Object.assign(new User(), {
          firstName: "B",
          lastName: "R",
          email: "rb@test.com",
          password: "",
          role: UserRole.User,
          verifyToken: "",
          tokenSecret: "",
          forgotPasswordToken: "",
        }),
        Object.assign(new User(), {
          firstName: "C",
          lastName: "R",
          email: "rc@test.com",
          password: "",
          role: UserRole.User,
          verifyToken: "",
          tokenSecret: "",
          forgotPasswordToken: "",
        }),
      ]);

      await ratingRepo.save([
        // Project A, criterionA: avg 2.5
        Object.assign(new Rating(), {
          project: projectA,
          criterion: criterionA,
          user: raterA,
          rating: 2,
        }),
        Object.assign(new Rating(), {
          project: projectA,
          criterion: criterionA,
          user: raterB,
          rating: 3,
        }),
        // Project A, criterionB: avg 1
        Object.assign(new Rating(), {
          project: projectA,
          criterion: criterionB,
          user: raterA,
          rating: 1,
        }),
        // Project B, criterionB: avg 4
        Object.assign(new Rating(), {
          project: projectB,
          criterion: criterionB,
          user: raterA,
          rating: 2,
        }),
        Object.assign(new Rating(), {
          project: projectB,
          criterion: criterionB,
          user: raterB,
          rating: 5,
        }),
        Object.assign(new Rating(), {
          project: projectB,
          criterion: criterionB,
          user: raterC,
          rating: 5,
        }),
      ]);

      // getRatingResults only counts projects that exist; exclude the default mockProject
      await projectRepo.delete(mockProject.id);

      const results = await ratingService.getRatingResults();

      expect(results).toHaveLength(2);

      const resultA = results.find((r) => r.project.id === projectA.id)!;
      expect(resultA).toBeDefined();
      expect(resultA.averagesPerCriterion[0].average).toEqual(2.5);
      expect(resultA.averagesPerCriterion[1].average).toEqual(1);

      const resultB = results.find((r) => r.project.id === projectB.id)!;
      expect(resultB).toBeDefined();
      expect(resultB.averagesPerCriterion[0].average).toEqual(4);
    });
  });
});
