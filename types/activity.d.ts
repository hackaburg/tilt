import { ISettings } from "./settings";
import { IUser } from "./user";

export const enum ActivityType {
  Signup = "signup",
  EmailVerified = "email_verified",
  SettingsUpdate = "settings_update",
}

export interface IActivityBase {
  user: IUser;
}

export interface ISignupActivity extends IActivityBase {
  type: ActivityType.Signup;
}

export interface IEmailVerifiedActivity extends IActivityBase {
  type: ActivityType.EmailVerified;
}

export interface ISettingsUpdateActivity extends IActivityBase {
  type: ActivityType.SettingsUpdate;
  previous: ISettings;
  next: ISettings;
}

export type IActivity =
  ISignupActivity
  | IEmailVerifiedActivity
  | ISettingsUpdateActivity
;
