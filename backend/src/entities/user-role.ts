/**
 * A user's role in tilt.
 */
export enum UserRole {
  /**
   * Superuser, can do everything.
   */
  Root = "root",
  /**
   * Slightly elevated user.
   */
  Moderator = "moderator",
  /**
   * Basic user.
   */
  User = "user",
}
