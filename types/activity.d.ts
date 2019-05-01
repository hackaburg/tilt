import { IUser } from "./user";

export const enum ActivityType {
  Signup = "signup",
  EmailVerified = "email_verified",
  SettingsUpdate = "settings_update",
}

export interface IActivity {
  user: IUser;
  timestamp: number;
  data: IActivityData;
}

export interface ISignupActivityData {
  type: ActivityType.Signup;
}

export interface IEmailVerifiedActivityData {
  type: ActivityType.EmailVerified;
}

export interface ISettingsUpdateActivityData {
  type: ActivityType.SettingsUpdate;
  previous: string;
  next: string;
}

export type IActivityData =
  ISignupActivityData
  | IEmailVerifiedActivityData
  | ISettingsUpdateActivityData
;
