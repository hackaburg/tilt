import { BadRequestError, Body, Get, HttpCode, JsonController, Post, QueryParam } from "routing-controllers";
import { Inject } from "typedi";
import { IUserLoginResponseBody } from "../../../types/user-login";
import { IUserSignupResponseBody } from "../../../types/user-signup";
import { IUserVerifyResponseBody } from "../../../types/user-verify";
import { IUserService, UserServiceToken } from "../services/user";
import { UserLoginApiRequest } from "../validation/user-login";
import { UserSignupApiRequest } from "../validation/user-signup";

/**
 * A controller to handle user specific tasks, e.g. signup or updating a profile.
 */
@JsonController("/user")
export class UsersController {
  public constructor(
    @Inject(UserServiceToken) private readonly _users: IUserService,
  ) { }

  /**
   * Create a user.
   */
  @HttpCode(201)
  @Post("/signup")
  public async signup(@Body() { data: { email, password } }: UserSignupApiRequest): Promise<IUserSignupResponseBody> {
    try {
      const user = await this._users.signup(email, password);

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
      await this._users.verifyUserByVerifyToken(token);

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
  public async login(@Body() { data: { email, password } }: UserLoginApiRequest): Promise<IUserLoginResponseBody> {
    const user = await this._users.findUserWithCredentials(email, password);

    if (!user) {
      throw new BadRequestError("invalid email or password");
    }

    return {
      token: this._users.generateLoginToken(user),
    };
  }
}
