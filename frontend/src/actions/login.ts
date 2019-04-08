import { Dispatch } from "redux";
import { IAction, IEmptyAction } from ".";
import { api } from "../api";

/**
 * Login redux action types.
 */
export enum LoginAction {
  StartLogin = "start_login",
  FinishLogin = "finish_login",
  FailLogin = "fail_login",
}

/**
 * Creates a @see LoginAction.StartLogin action.
 * @internal
 */
export const startLogin = (): IEmptyAction<LoginAction.StartLogin> => ({
  type: LoginAction.StartLogin,
});

/**
 * Creates a @see LoginAction.FinishLogin action.
 * @internal
 */
export const finishLogin = (): IEmptyAction<LoginAction.FinishLogin> => ({
  type: LoginAction.FinishLogin,
});

/**
 * Creates a @see LoginAction.FailLogin action.
 * @param error The error created during login failure
 * @internal
 */
export const failLogin = (error: string): IAction<LoginAction.FailLogin, string> => ({
  type: LoginAction.FailLogin,
  value: error,
});

/**
 * Asynchronously logs the user in.
 * @param email The user's email
 * @param password The user's password
 */
export const login = (email: string, password: string) => async (dispatch: Dispatch) => {
  dispatch(startLogin());

  try {
    await api.login(email, password);
    dispatch(finishLogin());
  } catch (error) {
    dispatch(failLogin(error.message));
  }
};
