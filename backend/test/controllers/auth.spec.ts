import { hash } from "bcrypt";
import * as http from "http";
import * as dotenv from "dotenv";
import * as path from 'path';

import { createExpressServer, useContainer } from "routing-controllers";
import { RatingController } from "../../src/controllers/rating-controller";
import { UsersController } from "../../src/controllers/users-controller";
import { User } from "../../src/entities/user";
import { UserRole } from "../../src/entities/user-role";
import { HttpService } from "../../src/services/http-service";
import { IRatingService } from "../../src/services/rating-service";
import { TokenService, ITokenService } from "../../src/services/token-service";
import { ConfigurationService, IConfigurationService } from "../../src/services/config-service";
import { UserService, IUserService } from "../../src/services/user-service";
import { IApplicationService } from "../../src/services/application-service";
import { MockedService } from "../services/mock";
import { MockRatingService } from "../services/mock/mock-rating-service";
import { MockApplicationService } from "../services/mock/mock-application-service";
import { MockEmailTemplateService } from "../services/mock/mock-email-template-service";
import { MockLoggerService } from "../services/mock/mock-logger-service";
import { MockHaveibeenpwnedService } from "../services/mock/mock-haveibeenpwned-service";
import { Repository } from "typeorm";
import { TestDatabaseService } from "../services/mock/mock-database-service";
import { ResponseInterceptor } from "../../src/interceptors/response-interceptor";

/*
 * These tests just check that UserRoles and stuff work as expected.
 * And that the backend can actually receive http requests
 */
describe("Auth", () => {
  let database: TestDatabaseService;
  let ratingService: MockedService<IRatingService>;
  let applicationService: MockedService<IApplicationService>;
  // An actual userService that talks to the in-memory test database
  let userService: IUserService;
  let configurationService: IConfigurationService;
  let tokenService: ITokenService<any>;

  beforeEach(() => {
    ratingService = new MockRatingService();
  });

  let server: http.Server;
  let port: number;
  let baseUrl: string;

  let userRepo: Repository<User>;

  let rootUser: User;
  let regularUser: User;

  let rootToken: string;
  let regularUserToken: string;

  const password = "test1234";

  // const tokenMap: Record<string, User> = {
  //   "root-token": rootUser,
  //   "user-token": regularUser,
  // };

  // const emailMap: Record<string, User> = {
  //   [rootUser.email]: rootUser,
  //   [regularUser.email]: regularUser,
  // };

  beforeAll(async () => {
    rootUser = Object.assign(new User(), {
      id: 1,
      role: UserRole.Root,
      createdAt: new Date("2026-01-01"),
      updatedAt: new Date("2026-04-12"),
      firstName: "rootFirst",
      lastName: "rootLast",
      email: "root@root.root",
      password: await hash(password, 10),
      tokenSecret: "root_secret_token_key_abc123",
      verifyToken: "",
      forgotPasswordToken: "forgot_password_token_def456",
      initialProfileFormSubmittedAt: new Date("2026-02-01"),
      confirmationExpiresAt: new Date("2026-05-01"),
      profileSubmitted: true,
      admitted: true,
      confirmed: true,
      declined: false,
      checkedIn: true,
    });

    regularUser = Object.assign(new User(), {
      id: 2,
      role: UserRole.User,
      createdAt: new Date("2026-01-01"),
      updatedAt: new Date("2026-04-12"),
      firstName: "regularFirst",
      lastName: "regularLast",
      email: "regular@regular.regular",
      password: await hash(password, 10),
      tokenSecret: "regular_secret_token_key_abc123",
      verifyToken: "",
      forgotPasswordToken: "forgot_password_token_def456",
      initialProfileFormSubmittedAt: new Date("2026-02-01"),
      confirmationExpiresAt: new Date("2026-05-01"),
      profileSubmitted: true,
      admitted: true,
      confirmed: true,
      declined: false,
      checkedIn: true,
    });

    dotenv.config({ path: path.resolve(__dirname, '../../.env.example') });

    database = new TestDatabaseService();
    await database.bootstrap();

    userRepo = database.getRepository(User);
    await userRepo.save([rootUser, regularUser]);

    ratingService = new MockRatingService();
    applicationService = new MockApplicationService();
    configurationService = new ConfigurationService();
    tokenService = new TokenService(configurationService);
    userService = new UserService(
      new MockHaveibeenpwnedService().instance,
      database,
      new MockLoggerService().instance,
      tokenService,
      new MockEmailTemplateService().instance,
    );

    await tokenService.bootstrap();
    await configurationService.bootstrap();
    await userService.bootstrap();

    rootToken = tokenService.sign({ secret: rootUser.tokenSecret })
    regularUserToken = tokenService.sign({ secret: regularUser.tokenSecret })

    // jest
    //   .spyOn(userService, 'findUserWithCredentials')
    //   .mockImplementation(async (email: string, password: string): Promise<User> => {
    //     return emailMap[email]
    //   });

    const httpService = new HttpService(
      null as any,
      null as any,
      userService,
    );

    useContainer({
      get(target: Function) {
        if (target === RatingController) {
          return new RatingController(ratingService.instance);
        }
        if (target === UsersController) {
          return new UsersController(
            userService,
            applicationService.instance,
          );
        }
        return new (target as any)();
      },
    } as any);

    const app = createExpressServer({
      controllers: [RatingController, UsersController],
      routePrefix: "/api",
      currentUserChecker: (action) => httpService.getCurrentUser(action),
      authorizationChecker: (action, roles) =>
        httpService.isActionAuthorized(action, roles),
      interceptors: [ResponseInterceptor]
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
        Authorization: `Bearer ${regularUserToken}`,
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
      expect.objectContaining({
        id: regularUser.id
      })
    );
  });

  it("passes authorization for admin (Root) users", async () => {
    expect.assertions(1);

    ratingService.mocks.upsertRating.mockResolvedValue({} as any);

    const response = await fetch(`${baseUrl}/api/ratings/rate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${rootToken}`,
      },
      body: JSON.stringify({ data: {} }),
    });

    // Authorization passed; any status other than 403 is acceptable here
    expect(response.status).not.toBe(403);
  });

  describe("user controller", () => {
    it("logs in and does not expose sensitive data", async () => {
      const response = await fetch(`${baseUrl}/api/user/login`, {
        method: "POST",
        body: JSON.stringify({
          data: { email: regularUser.email, password },
        }),
        headers: { "Content-Type": "application/json" },
      });
      const { data } = await response.json();
      expect(data.user).toHaveProperty("id");
      expect(data.user).toHaveProperty("firstName");
      expect(data.user).toHaveProperty("lastName");
      expect(data.user).not.toHaveProperty("password");
      expect(data.user).not.toHaveProperty("tokenSecret");
      expect(data.user).not.toHaveProperty("verifyToken");
      expect(data.user).not.toHaveProperty("forgotPasswordToken");
    });

    it("/refreshtoken should not expose sensitive data", async () => {
      const response = await fetch(`${baseUrl}/api/user/refreshtoken`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${rootToken}`,
        },
      });
      const { data } = await response.json();
      expect(data.user).toHaveProperty("id");
      expect(data.user).toHaveProperty("firstName");
      expect(data.user).toHaveProperty("lastName");
      expect(data.user).not.toHaveProperty("password");
      expect(data.user).not.toHaveProperty("tokenSecret");
      expect(data.user).not.toHaveProperty("verifyToken");
      expect(data.user).not.toHaveProperty("forgotPasswordToken");
    });

    it("/list should not expose sensitive data", async () => {
      const response = await fetch(`${baseUrl}/api/user/list`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${rootToken}`,
        },
      });
      const { data } = await response.json();

      expect(data.length).toEqual(2);
      const ids = data.map((user: any) => user.id)
      expect(ids).toContain(rootUser.id)
      expect(ids).toContain(regularUser.id)

      for (const user of data) {
        expect(user).toHaveProperty("id");
        expect(user).toHaveProperty("firstName");
        expect(user).toHaveProperty("lastName");
        expect(user).not.toHaveProperty("password");
        expect(user).not.toHaveProperty("tokenSecret");
        expect(user).not.toHaveProperty("verifyToken");
        expect(user).not.toHaveProperty("forgotPasswordToken");
      }
    });
  });
});
