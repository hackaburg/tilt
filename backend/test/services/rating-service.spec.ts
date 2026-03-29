import { BadRequestError, ForbiddenError, NotFoundError } from "routing-controllers";
import { Criteria } from "../../src/entities/criteria";
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
  const mockTeam = Object.assign(new Team(), { id: 10, users: [2, 3] });
  const mockProject = Object.assign(new Project(), {
    id: 100,
    team: mockTeam,
    allowRating: true,
  });
  const mockCriteria = Object.assign(new Criteria(), { id: 5 });
  const mockRating = Object.assign(new Rating(), {
    project: mockProject,
    user: mockUser,
    critera: mockCriteria,
  });

  beforeEach(async () => {
    settingsService = new MockSettingsService();

    mockRatingsRepo = { findOneBy: jest.fn(), findOne: jest.fn(), save: jest.fn(), delete: jest.fn() };
    mockProjectsRepo = { findOneBy: jest.fn() };
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

        settingsService.mocks.getSettings.mockResolvedValue({ allowRating: false } as any);

        await expect(ratingService.createRating(mockRating, mockUser)).rejects.toThrow(
          ForbiddenError,
        );
      });

      it("throws NotFoundError when project does not exist", async () => {
        expect.assertions(1);

        settingsService.mocks.getSettings.mockResolvedValue({ allowRating: true } as any);
        mockProjectsRepo.findOneBy.mockResolvedValue(null);

        await expect(ratingService.createRating(mockRating, mockUser)).rejects.toThrow(
          NotFoundError,
        );
      });

      it("throws ForbiddenError when project disallows rating", async () => {
        expect.assertions(1);

        settingsService.mocks.getSettings.mockResolvedValue({ allowRating: true } as any);
        mockProjectsRepo.findOneBy.mockResolvedValue(
          Object.assign(new Project(), { ...mockProject, allowRating: false }),
        );

        await expect(ratingService.createRating(mockRating, mockUser)).rejects.toThrow(
          ForbiddenError,
        );
      });

      it("throws NotFoundError when team does not exist", async () => {
        expect.assertions(1);

        settingsService.mocks.getSettings.mockResolvedValue({ allowRating: true } as any);
        mockProjectsRepo.findOneBy.mockResolvedValue(mockProject);
        mockTeamsRepo.findOneBy.mockResolvedValue(null);

        await expect(ratingService.createRating(mockRating, mockUser)).rejects.toThrow(
          NotFoundError,
        );
      });

      it("throws ForbiddenError when user tries to rate their own project", async () => {
        expect.assertions(1);

        settingsService.mocks.getSettings.mockResolvedValue({ allowRating: true } as any);
        mockProjectsRepo.findOneBy.mockResolvedValue(mockProject);
        mockTeamsRepo.findOneBy.mockResolvedValue(
          Object.assign(new Team(), { ...mockTeam, users: [1, 2, 3] }),
        );

        await expect(ratingService.createRating(mockRating, mockUser)).rejects.toThrow(
          ForbiddenError,
        );
      });

      it("creates a rating when all permissions are satisfied", async () => {
        expect.assertions(2);

        settingsService.mocks.getSettings.mockResolvedValue({ allowRating: true } as any);
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

        settingsService.mocks.getSettings.mockResolvedValue({ allowRating: true } as any);
        mockProjectsRepo.findOneBy.mockResolvedValue(mockProject);
        mockTeamsRepo.findOneBy.mockResolvedValue(mockTeam);
        mockRatingsRepo.findOne.mockResolvedValue(mockRating);

        await expect(ratingService.createRating(mockRating, mockUser)).rejects.toThrow(
          BadRequestError,
        );
      });
    });
  });
});
