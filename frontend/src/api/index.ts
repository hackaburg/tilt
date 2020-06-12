import { SettingsDTO, UserRole } from "./types";

/**
 * Describes API methods provided by tilt.
 */
export interface IApi {
  /**
   * Gets the application settings.
   */
  getSettings(): Promise<SettingsDTO>;

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
  verifyEmail(token: string): Promise<void>;

  /**
   * Logs a user in.
   * @param email The user's email
   * @param password The user's password
   * @return The user's role
   */
  login(email: string, password: string): Promise<UserRole>;

  /**
   * Refreshes the login token.
   * @return The user's role
   */
  refreshLoginToken(): Promise<UserRole>;

  /**
   * Updates the settings.
   * @param settings The changed settings
   */
  updateSettings(settings: SettingsDTO): Promise<SettingsDTO>;
}
