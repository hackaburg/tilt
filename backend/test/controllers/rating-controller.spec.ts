import { getMetadataArgsStorage } from "routing-controllers";
import { validate } from "class-validator";
import { plainToClass } from "class-transformer";
import { RatingController } from "../../src/controllers/rating-controller";
import { RatingDTO } from "../../src/controllers/dto";
import { Rating } from "../../src/entities/rating";
import { User } from "../../src/entities/user";
import { UserRole } from "../../src/entities/user-role";
import { IRatingService } from "../../src/services/rating-service";
import { ISettingsService } from "../../src/services/settings-service";
import { MockedService } from "../services/mock";
import { MockRatingService } from "../services/mock/mock-rating-service";
import { MockSettingsService } from "../services/mock/mock-settings-service";

describe("RatingController", () => {
  let ratingService: MockedService<IRatingService>;
  let settingsService: MockedService<ISettingsService>;
  let controller: RatingController;

  beforeEach(() => {
    ratingService = new MockRatingService();
    settingsService = new MockSettingsService();
    controller = new RatingController(settingsService.instance, ratingService.instance);
  });

  it("creates a rating and delegates to the rating service", async () => {
    expect.assertions(2);

    const ratingDTO = new RatingDTO();
    (ratingDTO as any).rating = 3;

    const user = new User();
    const createdRating = new Rating();
    (createdRating as any).id = 1;

    ratingService.mocks.createRating.mockResolvedValue(createdRating);

    const result = await controller.createRating({ data: ratingDTO }, user);

    expect(ratingService.mocks.createRating).toBeCalled();
    expect(result).toBeDefined();
  });

  describe("authorization", () => {
    it("only allows admin (root) users to call createRating", () => {
      expect.assertions(2);

      const storage = getMetadataArgsStorage();
      const authEntry = storage.responseHandlers.find(
        (h: any) =>
          h.type === "authorized" &&
          h.target === RatingController &&
          h.method === "createRating",
      );

      expect(authEntry).toBeDefined();
      expect(authEntry!.value).toBe(UserRole.Root);
    });

    it("does not allow non-admin users to call createRating", () => {
      expect.assertions(1);

      const storage = getMetadataArgsStorage();
      const authEntry = storage.responseHandlers.find(
        (h: any) =>
          h.type === "authorized" &&
          h.target === RatingController &&
          h.method === "createRating",
      );

      expect(authEntry!.value).not.toBe(UserRole.User);
    });
  });

  describe("rating value validation", () => {
    it("rejects a rating of 0", async () => {
      expect.assertions(1);

      const dto = plainToClass(RatingDTO, { rating: 0 });
      const errors = await validate(dto, { skipMissingProperties: true });
      const ratingErrors = errors.filter(e => e.property === "rating");

      expect(ratingErrors.length).toBeGreaterThan(0);
    });

    it("rejects a rating of 6", async () => {
      expect.assertions(1);

      const dto = plainToClass(RatingDTO, { rating: 6 });
      const errors = await validate(dto, { skipMissingProperties: true });
      const ratingErrors = errors.filter(e => e.property === "rating");

      expect(ratingErrors.length).toBeGreaterThan(0);
    });

    it("accepts a rating of 1", async () => {
      expect.assertions(1);

      const dto = plainToClass(RatingDTO, { rating: 1 });
      const errors = await validate(dto, { skipMissingProperties: true });
      const ratingErrors = errors.filter(e => e.property === "rating");

      expect(ratingErrors).toHaveLength(0);
    });

    it("accepts a rating of 5", async () => {
      expect.assertions(1);

      const dto = plainToClass(RatingDTO, { rating: 5 });
      const errors = await validate(dto, { skipMissingProperties: true });
      const ratingErrors = errors.filter(e => e.property === "rating");

      expect(ratingErrors).toHaveLength(0);
    });
  });
});
