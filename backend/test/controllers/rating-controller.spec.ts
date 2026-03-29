import * as http from "http";
import { createExpressServer, useContainer } from "routing-controllers";
import { validate } from "class-validator";
import { plainToClass } from "class-transformer";
import { RatingController } from "../../src/controllers/rating-controller";
import { RatingDTO } from "../../src/controllers/dto";
import { Rating } from "../../src/entities/rating";
import { User } from "../../src/entities/user";
import { UserRole } from "../../src/entities/user-role";
import { HttpService } from "../../src/services/http-service";
import { IRatingService } from "../../src/services/rating-service";
import { ISettingsService } from "../../src/services/settings-service";
import { IUserService } from "../../src/services/user-service";
import { MockedService } from "../services/mock";
import { MockRatingService } from "../services/mock/mock-rating-service";
import { MockSettingsService } from "../services/mock/mock-settings-service";
import { MockUserService } from "../services/mock/mock-user-service";

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
    let server: http.Server;
    let port: number;
    let httpRatingService: MockedService<IRatingService>;
    let httpSettingsService: MockedService<ISettingsService>;
    let httpUserService: MockedService<IUserService>;

    const rootUser = Object.assign(new User(), { id: 1, role: UserRole.Root });
    const regularUser = Object.assign(new User(), { id: 2, role: UserRole.User });

    const tokenMap: Record<string, User> = {
      "root-token": rootUser,
      "user-token": regularUser,
    };

    beforeAll(async () => {
      httpRatingService = new MockRatingService();
      httpSettingsService = new MockSettingsService();
      httpUserService = new MockUserService();

      httpUserService.mocks.findUserByLoginToken.mockImplementation(
        async (token: string) => tokenMap[token] ?? null,
      );

      const httpService = new HttpService(null as any, null as any, httpUserService.instance);

      useContainer({
        get(target: Function) {
          if (target === RatingController) {
            return new RatingController(httpSettingsService.instance, httpRatingService.instance);
          }
          return new (target as any)();
        },
      } as any);

      const app = createExpressServer({
        controllers: [RatingController],
        routePrefix: "/api",
        currentUserChecker: (action) => httpService.getCurrentUser(action),
        authorizationChecker: (action, roles) => httpService.isActionAuthorized(action, roles),
      });

      server = http.createServer(app);
      await new Promise<void>(resolve => server.listen(0, () => resolve()));
      port = (server.address() as any).port;
    });

    afterAll(async () => {
      await new Promise<void>((resolve, reject) =>
        server.close(err => (err ? reject(err) : resolve())),
      );
    });

    it("rejects unauthenticated requests with 403", async () => {
      expect.assertions(1);

      const response = await fetch(`http://localhost:${port}/api/ratings/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: {} }),
      });

      expect(response.status).toBe(403);
    });

    it("rejects requests from User-role users with 403", async () => {
      expect.assertions(1);

      const response = await fetch(`http://localhost:${port}/api/ratings/rate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer user-token",
        },
        body: JSON.stringify({ data: {} }),
      });

      expect(response.status).toBe(403);
    });

    it("passes authorization for admin (Root) users", async () => {
      expect.assertions(1);

      httpRatingService.mocks.createRating.mockResolvedValue({} as any);

      const response = await fetch(`http://localhost:${port}/api/ratings/rate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer root-token",
        },
        body: JSON.stringify({ data: {} }),
      });

      // Authorization passed; any status other than 403 is acceptable here
      expect(response.status).not.toBe(403);
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
