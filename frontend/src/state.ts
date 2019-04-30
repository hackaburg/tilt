import { IActivity } from "../../types/activity";
import { UserRole } from "../../types/roles";
import { ISettings } from "../../types/settings";

/**
 * T or null
 */
export type Nullable<T> = T | null;

/**
 * Describes the frontend state.
 */
export interface IState {
  request: IRequest;
  settings: Nullable<ISettings>;
  form: IForm;
  role: Nullable<UserRole>;
  notification: INotification;
  activity: Nullable<IActivity[]>;
}

interface IRequest {
  requestInProgress: boolean;
  error?: string;
}

interface IForm {
  type: FormType;
}

/**
 * The currently displayed form action type.
 */
export enum FormType {
  None = "none",
  Login = "login",
  Signup = "signup",
  MailSettings = "mail_settings",
  ApplicationSettings = "application_settings",
}

interface INotification {
  show: boolean;
  text: string;
}
