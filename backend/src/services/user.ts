import { compare, genSalt, hash } from "bcrypt";
import { Inject, Service, Token } from "typedi";
import { Repository } from "typeorm";
import { IService } from ".";
import { ActivityEvent } from "../../../types/activity";
import { UserRole } from "../../../types/roles";
import { User } from "../entities/user";
import { ActivityServiceToken, IActivityService } from "./activity";
import { DatabaseServiceToken, IDatabaseService } from "./database";
import { ILoggerService, LoggerServiceToken } from "./log";
import { ITokenService, TokenServiceToken } from "./tokens";

/**
 * An interface describing user handling.
 */
export interface IUserService extends IService {
  /**
   * Adds a new user with the given credentials.
   * @param email The user's email
   * @param password The user's plaintext password
   */
  signup(email: string, password: string): Promise<User>;

  /**
   * Sets the verified flag on a user with the given token.
   * @param verifyToken The token sent to the user
   */
  verifyUserByVerifyToken(verifyToken: string): Promise<void>;

  /**
   * Generate a login token for the given user.
   * @param user The user to generate a token for
   */
  generateLoginToken(user: User): string;

  /**
   * Find a user with their login token.
   * @param token A user's login token
   */
  findUserByLoginToken(token: string): Promise<User | undefined>;

  /**
   * Checks the user's credentials and returns the user.
   * @param email The user's email
   * @param password The user's password
   */
  findUserWithCredentials(email: string, password: string): Promise<User | undefined>;
}

/**
 * A token used to inject a concrete user service.
 */
export const UserServiceToken = new Token<IUserService>();

interface ITokenContent {
  id: User["id"];
}

/**
 * A service to handle users.
 */
@Service(UserServiceToken)
export class UserService implements IUserService {
  private _users?: Repository<User>;

  public constructor(
    @Inject(DatabaseServiceToken) private readonly _database: IDatabaseService,
    @Inject(LoggerServiceToken) private readonly _logger: ILoggerService,
    @Inject(ActivityServiceToken) private readonly _activity: IActivityService,
    @Inject(TokenServiceToken) private readonly _tokens: ITokenService<ITokenContent>,
  ) { }

  /**
   * Sets up the user service.
   */
  public async bootstrap(): Promise<void> {
    this._users = this._database.getRepository(User);
  }

  /**
   * Adds a new user.
   * @param email The user's email
   * @param password The user's password
   */
  public async signup(email: string, password: string): Promise<User> {
    const user = new User();
    user.email = email;
    user.password = await hash(password, 10);
    user.verifyToken = await genSalt(10);
    user.role = UserRole.User;

    const now = new Date();
    user.createdAt = now;
    user.updatedAt = now;

    await this._users!.save(user);
    this._logger.debug(`${user.email} signed up, token ${user.verifyToken}`);
    this._activity.addActivity(user, ActivityEvent.Signup);

    return user;
  }

  /**
   * Verifies an account using it's verifyToken.
   * @param verifyToken The token sent to the user
   */
  public async verifyUserByVerifyToken(verifyToken: string): Promise<void> {
    const user = await this._users!.findOneOrFail({
      where: {
        verifyToken,
      },
    });

    user.didVerifyEmail = true;
    user.verifyToken = "";
    user.updatedAt = new Date();

    await this._users!.save(user);
    this._logger.debug(`${user.email} verified their email`);
    this._activity.addActivity(user, ActivityEvent.EmailVerified);
  }

  /**
   * Generate a login token for the given user.
   * @param user The user to generate a token for
   */
  public generateLoginToken(user: User): string {
    return this._tokens.sign({
      id: user.id,
    });
  }

  /**
   * Find a user with their login token.
   * @param token A user's login token
   */
  public async findUserByLoginToken(token: string): Promise<User | undefined> {
    try {
      const { id } = this._tokens.decode(token);
      return await this._users!.findOne(id);
    } catch (error) {
      return;
    }
  }

  /**
   * Checks the user's credentials and returns the user.
   * @param email The user's email
   * @param password The user's password
   */
  public async findUserWithCredentials(email: string, password: string): Promise<User | undefined> {
    const user = await this._users!.findOne({
      select: [
        "id",
        "password",
      ],
      where: {
        email,
      },
    });

    if (!user) {
      return;
    }

    const passwordsMatch = await compare(password, user.password);

    if (passwordsMatch) {
      return user;
    }
  }
}
