import { compare, genSalt, hash } from "bcrypt";
import { Inject, Service, Token } from "typedi";
import { Repository } from "typeorm";
import { IService } from ".";
import { User } from "../entities/user";
import { UserRole } from "../entities/user-role";
import { DatabaseServiceToken, IDatabaseService } from "./database-service";
import {
  EmailTemplateServiceToken,
  IEmailTemplateService,
} from "./email-template-service";

import { ILoggerService, LoggerServiceToken } from "./logger-service";
import { ITokenService, TokenServiceToken } from "./token-service";
import { BadRequestError } from "routing-controllers";

/**
 * An interface describing user handling.
 */
export interface IUserService extends IService {
  /**
   * Adds a new user with the given credentials.
   * @param email The user's email
   * @param password The user's plaintext password
   */
  signup(
    firstName: string,
    lastName: string,
    email: string,
    password: string,
  ): Promise<User>;

  /**
   * Sets the forgot password token on a user with the given email.
   * @param email
   */
  forgotPassword(email: string): void;

  /**
   * Sets the verified flag on a user with the given token.
   * @param verifyToken The token sent to the user
   */
  verifyUserByVerifyToken(verifyToken: string): Promise<User>;

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
  findUserWithCredentials(
    email: string,
    password: string,
  ): Promise<User | undefined>;

  /**
   * Checks the user's password reset.
   * @param email The user's email
   * @param password The user's password
   * @param token The reset token
   */
  verifyUserResetPassword(
    password: string,
    token: string,
  ): Promise<User | undefined>;

  /**
   * Finds users by their ids.
   * @param userIDs The users' id
   */
  findUsersByIDs(
    userIDs: readonly number[],
  ): Promise<ReadonlyArray<User | null>>;

  /**
   * Updates the given user.
   * @param user The user to update
   */
  updateUser(user: User): Promise<void>;

  /**
   * Updates all given users.
   * @param users The users to update
   */
  updateUsers(users: readonly User[]): Promise<void>;

  /**
   * Finds all users.
   */
  findAll(): Promise<readonly User[]>;

  /**
   * Deletes the given user.
   * @param user The user to delete
   */
  deleteUser(user: User): Promise<void>;
}

/**
 * A token used to inject a concrete user service.
 */
export const UserServiceToken = new Token<IUserService>();

interface ITokenContent {
  secret: string;
}

/**
 * A service to handle users.
 */
@Service(UserServiceToken)
export class UserService implements IUserService {
  private _users!: Repository<User>;

  public constructor(
    @Inject(DatabaseServiceToken) private readonly _database: IDatabaseService,
    @Inject(LoggerServiceToken) private readonly _logger: ILoggerService,
    @Inject(TokenServiceToken)
    private readonly _tokens: ITokenService<ITokenContent>,
    @Inject(EmailTemplateServiceToken)
    private readonly _email: IEmailTemplateService,
  ) {}

  /**
   * Sets up the user service.
   */
  public async bootstrap(): Promise<void> {
    this._users = this._database.getRepository(User);
  }

  /**
   * Adds a new user.
   * @param firstName The user's first name
   * @param lastName The user's last name
   * @param email The user's email
   * @param password The user's password
   */
  public async signup(
    firstName: string,
    lastName: string,
    email: string,
    password: string,
  ): Promise<User> {
    /*
    const passwordReuseCount = await this._haveibeenpwned.getPasswordUsedCount(
      password,
    );

    if (passwordReuseCount > 0) {
      throw new PasswordReuseError(passwordReuseCount);
    }
    */

    const existingUser = await this._users.findOne({
      where: {
        email,
      },
    });

    if (existingUser && existingUser.verifyToken) {
      this._logger.debug(
        `${existingUser.email} signed up again, resending verification email`,
      );
      await this._email.sendVerifyEmail(existingUser);
      return existingUser;
    }

    if (existingUser) {
      throw new Error("email already registered");
    }

    const user = new User();
    user.firstName = firstName;
    user.lastName = lastName;
    user.email = email;
    user.password = await hash(password, 10);
    user.verifyToken = await genSalt(10);
    user.role = UserRole.User;

    // it's safe to use an emtpy secret here and set a real secret 10 lines below,
    // since the user isn't verified and, by default, this user isn't elevated yet
    user.tokenSecret = "";
    user.forgotPasswordToken = "";

    try {
      await this._users.save(user);
    } catch (error) {
      throw error;
    }

    // `genSalt` could technically collide, so we'll prepend the user's id
    user.tokenSecret = `${user.id}//${await genSalt(10)}`;
    await this._users.save(user);

    this._logger.debug(`${user.email} signed up, token ${user.verifyToken}`);

    await this._email.sendVerifyEmail(user);
    return user;
  }

  /**
   * Generate a login token for the given user.
   * @param user The user to generate a token for
   */
  public async forgotPassword(email: string): Promise<void> {
    const user = await this._users.findOne({
      where: {
        email,
      },
    });

    if (user) {
      user.forgotPasswordToken = await genSalt(10);
      await this._users.save(user);
      this._logger.debug(`${user.email} forgot password`);
      await this._email.sendForgotPasswordEmail(user);
    }
  }

  /**
   * Verifies an account using it's verifyToken.
   * @param verifyToken The token sent to the user
   */
  public async verifyUserByVerifyToken(verifyToken: string): Promise<User> {
    const user = await this._users.findOneOrFail({
      where: {
        verifyToken,
      },
    });

    user.verifyToken = "";

    await this._users.save(user);
    this._logger.debug(`${user.email} verified their email`);
    return user;
  }

  /**
   * Generate a login token for the given user.
   * @param user The user to generate a token for
   */
  public generateLoginToken(user: User): string {
    return this._tokens.sign({
      secret: user.tokenSecret,
    });
  }

  /**
   * Find a user with their login token.
   * @param token A user's login token
   */
  public async findUserByLoginToken(token: string): Promise<User | undefined> {
    try {
      const { secret } = this._tokens.decode(token);
      return await this._users.findOne(
        {
          tokenSecret: secret,
        },
        {
          cache: 20 * 1000,
        },
      );
    } catch (error) {
      return;
    }
  }

  /**
   * Checks the user's credentials and returns the user.
   * @param email The user's email
   * @param password The user's password
   */
  public async findUserWithCredentials(
    email: string,
    password: string,
  ): Promise<User | undefined> {
    const user = await this._users.findOne({
      select: ["id", "password", "role", "verifyToken"],
      where: {
        email,
      },
    });

    if (!user) {
      return;
    }

    if (user.verifyToken) {
      return;
    }

    const passwordsMatch = await compare(password, user.password);

    if (passwordsMatch) {
      return await this._users.findOneOrFail(user.id);
    }
  }

  /**
   * Checks the user's password reset.
   * @param email The user's email
   * @param password The user's password
   */
  public async verifyUserResetPassword(
    password: string,
    token: string,
  ): Promise<User | undefined> {
    const user = await this._users.findOne({
      where: {
        forgotPasswordToken: token,
      },
    });

    if (!user) {
      throw new BadRequestError("invalid token");
    }

    if (user.forgotPasswordToken === token) {
      user.password = await hash(password, 10);
      user.forgotPasswordToken = "";
      await this._users.save(user);
    }
    return;
  }

  /**
   * @inheritdoc
   */
  public async findUsersByIDs(
    userIDs: readonly number[],
  ): Promise<ReadonlyArray<User | null>> {
    const users = await this._users.findByIds(userIDs as number[]);
    return users.map((user) => user ?? null);
  }

  /**
   * @inheritdoc
   */
  public async updateUser(user: User): Promise<void> {
    await this._users.save(user);
  }

  /**
   * @inheritdoc
   */
  public async updateUsers(users: readonly User[]): Promise<void> {
    await this._users.save(users as User[]);
  }

  /**
   * @inheritdoc
   */
  public async findAll(): Promise<readonly User[]> {
    return await this._users.find();
  }

  /**
   * @inheritdoc
   */
  public async deleteUser(user: User): Promise<void> {
    await this._users.delete({
      id: user.id,
      role: UserRole.User,
    });
  }
}
