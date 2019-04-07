import { apiBaseUrl, isProductionEnabled } from "../config";
import { BackendApi } from "./backend-api";
import { StaticApi } from "./static-api";

/**
 * Describes API methods provided by tilt.
 */
export interface IApi {
  /**
   * Creates an account.
   * @param email The user's email
   * @param password The user's password
   */
  signup(email: string, password: string): Promise<string>;

  /**
   * Verifies a user's email.
   * @param token The verify token from the email
   */
  verfiyEmail(token: string): Promise<void>;

  /**
   * Logs a user in.
   * @param email The user's email
   * @param password The user's password
   */
  login(email: string, password: string): Promise<void>;
}

/**
 * An api client, configured to either run against static data, or a tilt backend.
 */
export const api: IApi =
  (isProductionEnabled && apiBaseUrl)
    ? new BackendApi(apiBaseUrl)
    : new StaticApi();
