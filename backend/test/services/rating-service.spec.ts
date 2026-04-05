import { BadRequestError, ForbiddenError, NotFoundError } from "routing-controllers";
import { Criterion } from "../../src/entities/criterion";
import { Project } from "../../src/entities/project";
import { Rating } from "../../src/entities/rating";
import { Team } from "../../src/entities/team";
import { User } from "../../src/entities/user";
import { IDatabaseService } from "../../src/services/database-service";
import { IRatingService, RatingService } from "../../src/services/rating-service";
import { ISettingsService } from "../../src/services/settings-service";
import { MockedService } from "./mock";
import { MockSettingsService } from "./mock/mock-settings-service";

describe("RatingService", () => {
  let settingsService: MockedService<ISettingsService>;
  let mockRatingsRepo: any;
  let mockProjectsRepo: any;
  let mockTeamsRepo: any;
  let mockUsersRepo: any;
  let mockDatabase: IDatabaseService;
  let ratingService: IRatingService;

  const mockUser = Object.assign(new User(), { id: 1 });
  const mockTeam = Object.assign(new Team(), { id: 10, users: ["2", "3"] });
  const mockProject = Object.assign(new Project(), {
    id: 100,
    team: mockTeam,
    allowRating: true,
  });
  const mockCriterion = Object.assign(new Criterion(), { id: 5 });
  const mockRating = Object.assign(new Rating(), {
    project: mockProject,
    user: mockUser,
    criterion: mockCriterion,
  });

  beforeEach(async () => {
    settingsService = new MockSettingsService();

    mockRatingsRepo = {
      find: jest.fn(),
      findOneBy: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      delete: jest.fn()
    };
    mockProjectsRepo = {
      find: jest.fn(),
      findOneBy: jest.fn()
    };
    mockTeamsRepo = { findOneBy: jest.fn() };
    mockUsersRepo = { findOneBy: jest.fn() };

    mockDatabase = {
      bootstrap: jest.fn(),
      getRepository: jest.fn().mockImplementation((entity: any) => {
        if (entity === Rating) return mockRatingsRepo;
        if (entity === Project) return mockProjectsRepo;
        if (entity === Team) return mockTeamsRepo;
        if (entity === User) return mockUsersRepo;
        return {};
      }),
    } as any;

    ratingService = new RatingService(mockDatabase, settingsService.instance);
    await ratingService.bootstrap();
  });

  describe("checkPermission", () => {
    describe("via createRating", () => {
      it("throws ForbiddenError when rating is globally disabled", async () => {
        expect.assertions(1);

        settingsService.mocks.getSettings.mockResolvedValue(
          { application: { allowRatingProjects: false } } as any
        );

        await expect(ratingService.createRating(mockRating, mockUser)).rejects.toThrow(
          ForbiddenError,
        );
      });

      it("throws NotFoundError when project does not exist", async () => {
        expect.assertions(1);

        settingsService.mocks.getSettings.mockResolvedValue(
          { application: { allowRatingProjects: true } } as any
        );

        mockProjectsRepo.findOneBy.mockResolvedValue(null);

        await expect(ratingService.createRating(mockRating, mockUser)).rejects.toThrow(
          NotFoundError,
        );
      });

      it("throws ForbiddenError when project disallows rating", async () => {
        expect.assertions(1);

        settingsService.mocks.getSettings.mockResolvedValue(
          { application: { allowRatingProjects: true } } as any
        );

        mockProjectsRepo.findOneBy.mockResolvedValue(
          Object.assign(new Project(), { ...mockProject, allowRating: false }),
        );

        await expect(ratingService.createRating(mockRating, mockUser)).rejects.toThrow(
          ForbiddenError,
        );
      });

      it("throws NotFoundError when team does not exist", async () => {
        expect.assertions(1);

        settingsService.mocks.getSettings.mockResolvedValue(
          { application: { allowRatingProjects: true } } as any
        );

        mockProjectsRepo.findOneBy.mockResolvedValue(mockProject);
        mockTeamsRepo.findOneBy.mockResolvedValue(null);

        await expect(ratingService.createRating(mockRating, mockUser)).rejects.toThrow(
          NotFoundError,
        );
      });

      it("throws ForbiddenError when a user tries to rate their own project", async () => {
        expect.assertions(1);

        settingsService.mocks.getSettings.mockResolvedValue(
          { application: { allowRatingProjects: true } } as any
        );

        mockProjectsRepo.findOneBy.mockResolvedValue(mockProject);
        mockTeamsRepo.findOneBy.mockResolvedValue(
          Object.assign(new Team(), { ...mockTeam, users: ["1", "2", "3"] }),
        );

        await expect(ratingService.createRating(mockRating, mockUser)).rejects.toThrow(
          ForbiddenError,
        );
      });

      it("creates a rating when all permissions are satisfied", async () => {
        expect.assertions(2);

        settingsService.mocks.getSettings.mockResolvedValue(
          { application: { allowRatingProjects: true } } as any
        );

        mockProjectsRepo.findOneBy.mockResolvedValue(mockProject);
        mockTeamsRepo.findOneBy.mockResolvedValue(mockTeam);
        mockRatingsRepo.findOne.mockResolvedValue(null);
        const savedRating = Object.assign(new Rating(), { ...mockRating, id: 42 });
        mockRatingsRepo.save.mockResolvedValue(savedRating);

        const result = await ratingService.createRating(mockRating, mockUser);

        expect(result).toBe(savedRating);
        expect(mockRatingsRepo.save).toHaveBeenCalledWith(mockRating);
      });

      it("throws BadRequestError when user has already rated the same project and criteria", async () => {
        expect.assertions(1);

        settingsService.mocks.getSettings.mockResolvedValue(
          { application: { allowRatingProjects: true } } as any
        );

        mockProjectsRepo.findOneBy.mockResolvedValue(mockProject);
        mockTeamsRepo.findOneBy.mockResolvedValue(mockTeam);
        mockRatingsRepo.findOne.mockResolvedValue(mockRating);

        await expect(ratingService.createRating(mockRating, mockUser)).rejects.toThrow(
          BadRequestError,
        );
      });
    });
  });

  describe("getRatingResults", () => {
    it("aggregates ratings for two projects with two ratings each", async () => {
      expect.assertions(5);

      const projectA = Object.assign(new Project(), { id: 1, team: mockTeam });
      const projectB = Object.assign(new Project(), { id: 2, team: mockTeam });

      mockProjectsRepo.find.mockResolvedValue([ projectA, projectB ])

      const criterionA = Object.assign(new Criterion(), { id: 1 });
      const criterionB = Object.assign(new Criterion(), { id: 2 });

      const ratingsFixture = [
        // Project A
        Object.assign(new Rating(), { id: 1, project: projectA, criterion: criterionA, rating: 2 }),
        Object.assign(new Rating(), { id: 2, project: projectA, criterion: criterionA, rating: 3 }),
        Object.assign(new Rating(), { id: 3, project: projectA, criterion: criterionB, rating: 1 }),
        // Project B
        Object.assign(new Rating(), { id: 4, project: projectB, criterion: criterionB, rating: 2 }),
        Object.assign(new Rating(), { id: 5, project: projectB, criterion: criterionB, rating: 5 }),
        Object.assign(new Rating(), { id: 6, project: projectB, criterion: criterionB, rating: 5 }),
      ];

      mockRatingsRepo.find.mockResolvedValue(ratingsFixture);

      const results = await ratingService.getRatingResults();

      expect(results).toHaveLength(2);

      const resultA = results.find((r) => r.project.id === projectA.id)!;
      expect(resultA).toBeDefined();
      expect(resultA.criterionIdToAvg).toEqual({
        [criterionA.id]: 2.5,
        [criterionB.id]: 1,
      });

      const resultB = results.find((r) => r.project.id === projectB.id)!;
      expect(resultB).toBeDefined();
      expect(resultB.criterionIdToAvg).toEqual({
        [criterionB.id]: 4,
      });
    });
  });
});
