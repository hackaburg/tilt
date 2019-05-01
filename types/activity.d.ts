import { ISettings } from "./settings";

export const enum ActivityType {
  Signup = "signup",
  EmailVerified = "email_verified",
  SettingsUpdate = "settings_update",
}

export interface ISignupActivity {
  type: ActivityType.Signup;
}

export interface IEmailVerifiedActivity {
  type: ActivityType.EmailVerified;
}

export interface ISettingsUpdate {
  type: ActivityType.SettingsUpdate;
  previous: ISettings;
  next: ISettings;
}

export type IActivity =
  ISignupActivity
  | IEmailVerifiedActivity
  | ISettingsUpdate
;
