import {
  Authorized,
  BadRequestError,
  Body,
  CurrentUser,
  Get,
  HttpCode,
  JsonController,
  Post,
  QueryParam,
} from "routing-controllers";
import { Inject } from "typedi";
import { ActivityType } from "../../../types/activity";
import { UserRole } from "../../../types/roles";
import { IUserLoginResponseBody } from "../../../types/user-login";
import { IUserRefreshTokenResponseBody } from "../../../types/user-refreshtoken";
import { IUserRoleResponseBody } from "../../../types/user-role";
import { IUserSignupResponseBody } from "../../../types/user-signup";
import { IUserVerifyResponseBody } from "../../../types/user-verify";
import { User } from "../entities/user";
import {
  ActivityServiceToken,
  IActivityService,
} from "../services/activity-service";
import { IUserService, UserServiceToken } from "../services/user-service";
import { UserLoginApiRequest } from "../validation/user-login";
import { UserSignupApiRequest } from "../validation/user-signup";

/**
 * A controller to handle user specific tasks, e.g. signup or updating a profile.
 */
@JsonController("/user")
export class UsersController {
  public constructor(
    @Inject(UserServiceToken) private readonly _users: IUserService,
    @Inject(ActivityServiceToken) private readonly _activity: IActivityService,
  ) {}

  /**
   * Create a user.
   */
  @HttpCode(201)
  @Post("/signup")
  public async signup(@Body()
  {
    data: { email, password },
  }: UserSignupApiRequest): Promise<IUserSignupResponseBody> {
    try {
      const user = await this._users.signup(email, password);
      await this._activity.addActivity(user, {
        type: ActivityType.Signup,
      });

      return {
        email: user.email,
      };
    } catch (error) {
      throw new BadRequestError(error.message);
    }
  }

  /**
   * Verifies a user using their token.
   * @param token The token to verify.
   */
  @Get("/verify")
  public async verify(
    @QueryParam("token") token: string,
  ): Promise<IUserVerifyResponseBody> {
    try {
      const user = await this._users.verifyUserByVerifyToken(token);
      await this._activity.addActivity(user, {
        type: ActivityType.EmailVerified,
      });

      return {
        success: true,
      };
    } catch (error) {
      throw new BadRequestError("invalid token");
    }
  }

  /**
   * Generates a login token for the given credentials.
   * @param body The user's login credentials
   */
  @Post("/login")
  public async login(@Body()
  {
    data: { email, password },
  }: UserLoginApiRequest): Promise<IUserLoginResponseBody> {
    const user = await this._users.findUserWithCredentials(email, password);

    if (!user) {
      throw new BadRequestError("invalid email or password");
    }

    return {
      role: user.role,
      token: this._users.generateLoginToken(user),
    };
  }

  /**
   * Gets the current user's role.
   * @param user The current user
   */
  @Get("/role")
  @Authorized(UserRole.User)
  public async getRole(
    @CurrentUser() user: User,
  ): Promise<IUserRoleResponseBody> {
    return {
      role: user.role,
    };
  }

  /**
   * Regenerates the current user's token.
   * @param user The current user
   */
  @Get("/refreshtoken")
  @Authorized(UserRole.User)
  public async refreshLoginToken(
    @CurrentUser() user: User,
  ): Promise<IUserRefreshTokenResponseBody> {
    return {
      token: this._users.generateLoginToken(user),
    };
  }
}
