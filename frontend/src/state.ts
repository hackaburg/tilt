import type { SettingsDTO } from "./api/types/dto";
import { UserRole } from "./api/types/enums";

/**
 * T or null
 */
export type Nullable<T> = T | null;

/**
 * Describes the frontend state.
 */
export interface IState {
  request: IRequestCollection;
  settings: Nullable<SettingsDTO>;
  role: Nullable<UserRole>;
  notification: INotification;
}

type IRequestCollection = {
  [target in RequestTarget]: IRequest;
};

interface IRequest {
  requestInProgress: boolean;
  error?: string;
}

/**
 * The type of the request in action.
 */
export enum RequestTarget {
  None = "none",
  Login = "login",
  RefreshLoginToken = "refresh_login_token",
  Signup = "signup",
  FetchSettings = "fetch_settings",
  MailSettings = "mail_settings",
  ApplicationSettings = "application_settings",
  FrontendSettings = "frontend_settings",
  FetchRole = "get_role",
  VerifyEmail = "verify_email",
}

interface INotification {
  show: boolean;
  text: string;
}
