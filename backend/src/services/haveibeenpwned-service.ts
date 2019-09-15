import { pwnedPassword } from "hibp";
import { Service, Token } from "typedi";
import { IService } from ".";

/**
 * A service to integrate haveibeenpwned.
 */
export interface IHaveibeenpwnedService extends IService {
  /**
   * Check how often a password was found in haveibeenpwned.
   * @param password The password to query against haveibeenpwned
   */
  getPasswordUsedCount(password: string): Promise<number>;
}

/**
 * A token used to inject a concrete haveibeenpwned service.
 */
export const HaveibeenpwnedServiceToken = new Token<IHaveibeenpwnedService>();

@Service(HaveibeenpwnedServiceToken)
export class HaveibeenpwnedService implements IHaveibeenpwnedService {
  /**
   * Sets up the haveibeenpwned integration.
   */
  public async bootstrap(): Promise<void> {
    return;
  }

  /**
   * Check how often a password was found in haveibeenpwned.
   * @param password The password to query against haveibeenpwned
   */
  public async getPasswordUsedCount(password: string): Promise<number> {
    return await pwnedPassword(password);
  }
}

/**
 * An error indicating a reused password.
 */
export class PasswordReuseError extends Error {
  constructor(reuseCount: number) {
    super(`password was found ${reuseCount} times on haveibeenpwned.com`);
  }
}
