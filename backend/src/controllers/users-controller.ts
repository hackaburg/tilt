import {
  Authorized,
  BadRequestError,
  Body,
  CurrentUser,
  Delete,
  Get,
  HttpCode,
  JsonController,
  Param,
  Post,
  QueryParam,
} from "routing-controllers";
import { Inject } from "typedi";
import { User } from "../entities/user";
import { UserRole } from "../entities/user-role";
import {
  ApplicationServiceToken,
  IApplicationService,
} from "../services/application-service";
import { IUserService, UserServiceToken } from "../services/user-service";
import {
  convertBetweenEntityAndDTO,
  CredentialsRequestDTO,
  SignupResponseDTO,
  SuccessResponseDTO,
  UserDTO,
  UserTokenResponseDTO,
} from "./dto";

/**
 * A controller to handle user specific tasks, e.g. signup or updating a profile.
 */
@JsonController("/user")
export class UsersController {
  public constructor(
    @Inject(UserServiceToken) private readonly _users: IUserService,
    @Inject(ApplicationServiceToken)
    private readonly _applications: IApplicationService,
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
    } catch (error: any) {
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
  ): Promise<UserTokenResponseDTO> {
    const user = await this._users.findUserWithCredentials(email, password);

    if (!user) {
      throw new BadRequestError("invalid email or password");
    }

    const response = new UserTokenResponseDTO();
    response.token = this._users.generateLoginToken(user);
    response.user = convertBetweenEntityAndDTO(user, UserDTO);
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
  ): Promise<UserTokenResponseDTO> {
    const response = new UserTokenResponseDTO();
    response.token = this._users.generateLoginToken(user);
    response.user = convertBetweenEntityAndDTO(user, UserDTO);
    return response;
  }

  /**
   * Deletes the user with the given id.
   * @param userID The id of the user to delete
   */
  @Delete("/:id")
  @Authorized(UserRole.Moderator)
  public async deleteUser(@Param("id") userID: number): Promise<void> {
    const [user] = await this._users.findUsersByIDs([userID]);

    if (!user) {
      return;
    }

    await this._applications.deleteAnswers(user);
    await this._users.deleteUser(user);
  }
}
