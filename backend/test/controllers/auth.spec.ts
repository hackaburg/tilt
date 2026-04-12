import * as http from "http";
import { createExpressServer, useContainer } from "routing-controllers";
import { RatingController } from "../../src/controllers/rating-controller";
import { UsersController } from "../../src/controllers/users-controller";
import { User } from "../../src/entities/user";
import { UserRole } from "../../src/entities/user-role";
import { HttpService } from "../../src/services/http-service";
import { IRatingService } from "../../src/services/rating-service";
import { IUserService } from "../../src/services/user-service";
import { IApplicationService } from "../../src/services/application-service";
import { MockedService } from "../services/mock";
import { MockRatingService } from "../services/mock/mock-rating-service";
import { MockUserService } from "../services/mock/mock-user-service";
import { MockApplicationService } from "../services/mock/mock-application-service";

/*
 * These tests just check that UserRoles and stuff work as expected.
 * And that the backend can actually receive http requests
 */
describe("Auth", () => {
  let ratingService: MockedService<IRatingService>;
  let userService: MockedService<IUserService>;
  let applicationService: MockedService<IApplicationService>;

  beforeEach(() => {
    ratingService = new MockRatingService();
  });

  let server: http.Server;
  let port: number;
  let baseUrl: string;

  const rootUser = Object.assign(new User(), { id: 1, role: UserRole.Root });
  const regularUser = Object.assign(new User(), {
    id: 2,
    role: UserRole.User,
  });

  const tokenMap: Record<string, User> = {
    "root-token": rootUser,
    "user-token": regularUser,
  };

  beforeAll(async () => {
    ratingService = new MockRatingService();
    userService = new MockUserService();
    applicationService = new MockApplicationService();

    userService.mocks.findUserByLoginToken.mockImplementation(
      async (token: string) => tokenMap[token] ?? null,
    );

    const httpService = new HttpService(
      null as any,
      null as any,
      userService.instance,
    );

    useContainer({
      get(target: Function) {
        if (target === RatingController) {
          return new RatingController(ratingService.instance);
        }
        if (target === UsersController) {
          return new UsersController(userService.instance, applicationService.instance);
        }
        return new (target as any)();
      },
    } as any);

    const app = createExpressServer({
      controllers: [RatingController],
      routePrefix: "/api",
      currentUserChecker: (action) => httpService.getCurrentUser(action),
      authorizationChecker: (action, roles) =>
        httpService.isActionAuthorized(action, roles),
    });

    server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, () => resolve()));
    port = (server.address() as any).port;
    baseUrl = `http://localhost:${port}`;
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) =>
      server.close((err) => (err ? reject(err) : resolve())),
    );
  });

  it("rejects unauthenticated requests with 403", async () => {
    expect.assertions(1);

    const response = await fetch(`${baseUrl}/api/ratings/rate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: {} }),
    });

    expect(response.status).toBe(403);
  });

  it("allows requests from User-role users", async () => {
    expect.assertions(2);

    ratingService.mocks.upsertRating.mockResolvedValue({} as any);

    const response = await fetch(`${baseUrl}/api/ratings/rate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer user-token",
      },
      body: JSON.stringify({
        data: { rating: 3, project: { id: 1 }, criterion: { id: 2 } },
      }),
    });

    expect(response.status).toBe(200);
    expect(ratingService.mocks.upsertRating).toHaveBeenCalledWith(
      expect.objectContaining({
        project: expect.objectContaining({ id: 1 }),
        user: expect.objectContaining({ id: regularUser.id }),
        criterion: expect.objectContaining({ id: 2 }),
      }),
      regularUser,
    );
  });

  it("passes authorization for admin (Root) users", async () => {
    expect.assertions(1);

    ratingService.mocks.upsertRating.mockResolvedValue({} as any);

    const response = await fetch(`${baseUrl}/api/ratings/rate`, {
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

  describe("user controller", () => {
    it("/login should not expose sensitive data", async () => {
      const response = await fetch(`${baseUrl}/user/login`, {
        method: "POST",
        body: JSON.stringify({ username: "test", password: "test" }),
        headers: { "Content-Type": "application/json" },
      });
      console.log(await response.text());
      const data = await response.json();
      expect(data).not.toHaveProperty("password");
      expect(data).not.toHaveProperty("tokenSecret");
      expect(data).not.toHaveProperty("verifyToken");
      expect(data).not.toHaveProperty("forgotPasswordToken");
    });

    it("/refreshtoken should not expose sensitive data", async () => {
      const response = await fetch(`${baseUrl}/user/refreshtoken`, {
        method: "POST",
        headers: { Authorization: "Bearer your_jwt_token" },
      });
      const data = await response.json();
      expect(data).not.toHaveProperty("tokenSecret");
      expect(data).not.toHaveProperty("verifyToken");
      expect(data).not.toHaveProperty("forgotPasswordToken");
    });

    it("/list should not expose sensitive data", async () => {
      const response = await fetch(`${baseUrl}/user/list`, {
        method: "GET",
        headers: { Authorization: "Bearer your_jwt_token" },
      });
      const data = await response.json();
      for (const user of data) {
        expect(user).not.toHaveProperty("password");
        expect(user).not.toHaveProperty("tokenSecret");
        expect(user).not.toHaveProperty("verifyToken");
        expect(user).not.toHaveProperty("forgotPasswordToken");
      }
    });
  });
});
