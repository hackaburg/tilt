import { ISettings } from "../../types/settings";

/**
 * Describes the frontend state.
 */
export interface IState {
  request: IRequest;
  settings: ISettings;
  form: IForm;
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
