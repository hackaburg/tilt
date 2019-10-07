import { decode, sign, verify } from "jsonwebtoken";
import { Inject, Service, Token } from "typedi";
import { IService } from ".";
import {
  ConfigurationServiceToken,
  IConfigurationService,
} from "./config-service";

/**
 * An interface providing access to JsonWebTokens.
 */
export interface ITokenService<T> extends IService {
  /**
   * Encrypts data.
   * @param data The data to encrypt
   */
  sign(data: T): string;

  /**
   * Decrypts the given data.
   */
  decode(data: string): T;
}

/**
 * A token used to inject a concrete JsonWebToken service.
 */
export const TokenServiceToken = new Token<ITokenService<any>>();

/**
 * A JsonWebToken service.
 */
@Service(TokenServiceToken)
export class TokenService<T> implements ITokenService<T> {
  public constructor(
    @Inject(ConfigurationServiceToken)
    private readonly _config: IConfigurationService,
  ) {}

  /**
   * Bootstraps the service, i.e. noop.
   */
  public async bootstrap(): Promise<void> {
    return;
  }

  /**
   * Encrypts data.
   * @param data The data to encrypt
   */
  public sign(data: any): string {
    return sign(data, this._config.config.secrets.jwtSecret, {
      expiresIn: "2w",
    });
  }

  /**
   * Decrypts the given data.
   */
  public decode(token: string): T {
    verify(token, this._config.config.secrets.jwtSecret);
    return decode(token) as T;
  }
}
