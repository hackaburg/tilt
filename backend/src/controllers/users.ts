import { genSalt, hash } from "bcrypt";
import { BadRequestError, Body, Get, HttpCode, JsonController, Post, QueryParam } from "routing-controllers";
import { Repository } from "typeorm";
import { ActivityEvent } from "../../../types/activity";
import { IUserSignupResponseBody } from "../../../types/user-signup";
import { IUserVerifyResponseBody } from "../../../types/user-verify";
import { User } from "../entities/user";
import { ActivityService } from "../services/activity";
import { DatabaseService } from "../services/database";
import { LoggerService } from "../services/log";
import { UserSignupApiRequest } from "../validation/user-signup";

/**
 * A controller to handle user specific tasks, e.g. signup or updating a profile.
 */
@JsonController("/user")
export class UsersController {
  private readonly _users: Repository<User>;

  public constructor(
    private readonly _logger: LoggerService,
    private readonly _activity: ActivityService,
    database: DatabaseService,
  ) {
    this._users = database.getRepository(User);
  }

  /**
   * Create a user.
   */
  @HttpCode(201)
  @Post("/signup")
  public async signup(@Body() body: UserSignupApiRequest): Promise<IUserSignupResponseBody> {
    const user = new User();
    user.email = body.data.email;
    user.password = await hash(body.data.password, 10);
    user.verifyToken = await genSalt(10);

    const now = new Date();
    user.createdAt = now;
    user.updatedAt = now;

    try {
      await this._users.save(user);
      this._logger.debug(`${user.email} signed up, token ${user.verifyToken}`);
      this._activity.addActivity(user, ActivityEvent.Signup);

      return {
        email: user.email,
      };
    } catch (error) {
      throw new BadRequestError("email already registered");
    }
  }

  /**
   * Verifies a user using their token.
   * @param token The token to verify.
   */
  @Get("/verify")
  public async verify(@QueryParam("token") token: string): Promise<IUserVerifyResponseBody> {
    try {
      const user = await this._users.findOneOrFail({
        where: {
          verifyToken: token,
        },
      });

      user.didVerifyEmail = true;
      user.verifyToken = "";

      await this._users.save(user);
      this._logger.debug(`${user.email} verified their email`);
      this._activity.addActivity(user, ActivityEvent.EmailVerified);

      return {
        success: true,
      };
    } catch (error) {
      throw new BadRequestError("invalid token");
    }
  }
}
