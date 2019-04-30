import { ISettings } from "./settings";

export const enum ActivityEvent {
  Signup = "signup",
  EmailVerified = "email_verified",
  SettingsUpdate = "settings_update",
}

export interface ISignupActivity {
  event: ActivityEvent.Signup;
}

export interface IEmailVerifiedActivity {
  event: ActivityEvent.EmailVerified;
}

export interface ISettingsUpdate {
  event: ActivityEvent.SettingsUpdate;
  previous: ISettings;
  next: ISettings;
}

export type IActivity =
  ISignupActivity
  | IEmailVerifiedActivity
  | ISettingsUpdate
;
