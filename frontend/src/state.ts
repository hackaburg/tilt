import { UserRole } from "../../types/roles";
import { ISettings } from "../../types/settings";

type Nullable<T> = T | null;

/**
 * Describes the frontend state.
 */
export interface IState {
  request: IRequest;
  settings: ISettings;
  form: IForm;
  role: Nullable<UserRole>;
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
