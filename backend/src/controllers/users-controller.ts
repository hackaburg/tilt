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
import { User } from "../entities/user";
import { UserRole } from "../entities/user-role";
import { IUserService, UserServiceToken } from "../services/user-service";
import {
  CredentialsRequestDTO,
  LoginResponseDTO,
  RefreshTokenResponseDTO,
  SignupResponseDTO,
  SuccessResponseDTO,
} from "./dto";

/**
 * A controller to handle user specific tasks, e.g. signup or updating a profile.
 */
@JsonController("/user")
export class UsersController {
  public constructor(
    @Inject(UserServiceToken) private readonly _users: IUserService,
  ) {}

  /**
   * Create a user.
   */
  @HttpCode(201)
  @Post("/signup")
  public async signup(
    @Body()
    { data: { email, password } }: CredentialsRequestDTO,
  ): Promise<SignupResponseDTO> {
    try {
      const user = await this._users.signup(email, password);
      const response = new SignupResponseDTO();
      response.email = user.email;
      return response;
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
  ): Promise<SuccessResponseDTO> {
    try {
      await this._users.verifyUserByVerifyToken(token);
      const response = new SuccessResponseDTO();
      response.success = true;
      return response;
    } catch (error) {
      throw new BadRequestError("invalid token");
    }
  }

  /**
   * Generates a login token for the given credentials.
   * @param body The user's login credentials
   */
  @Post("/login")
  public async login(
    @Body()
    { data: { email, password } }: CredentialsRequestDTO,
  ): Promise<LoginResponseDTO> {
    const user = await this._users.findUserWithCredentials(email, password);

    if (!user) {
      throw new BadRequestError("invalid email or password");
    }

    const response = new LoginResponseDTO();
    response.role = user.role;
    response.token = this._users.generateLoginToken(user);
    return response;
  }

  /**
   * Regenerates the current user's token.
   * @param user The current user
   */
  @Get("/refreshtoken")
  @Authorized(UserRole.User)
  public async refreshLoginToken(
    @CurrentUser() user: User,
  ): Promise<RefreshTokenResponseDTO> {
    const response = new RefreshTokenResponseDTO();
    response.token = this._users.generateLoginToken(user);
    response.role = user.role;
    return response;
  }
}
