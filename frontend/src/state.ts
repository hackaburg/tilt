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
  settings: ISettings;
  form: IForm;
  role: Nullable<UserRole>;
  notification: INotification;
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
}

interface INotification {
  show: boolean;
  text: string;
}
