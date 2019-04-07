import { IApi } from ".";

/**
 * Async equivalent of a sleep/wait call.
 * @param ms The duration to sleep
 */
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * An api which yields static data.
 */
export class StaticApi implements IApi {
  /**
   * Simulates a signup api call.
   * @param email The user's email
   * @param _password The user's password
   */
  public async signup(email: string, _password: string): Promise<string> {
    await sleep(100);
    return email;
  }

  /**
   * Simulates an email verification api call.
   * @param token The verify token from the email
   */
  public async verfiyEmail(_token: string): Promise<void> {
    await sleep(100);
  }

  /**
   * Simulates a login api call.
   * @param email The user's email
   * @param password The user's password
   */
  public async login(_email: string, _password: string): Promise<void> {
    await sleep(100);
  }
}
