import { Dispatch } from "redux";
import { IAction, IEmptyAction } from ".";
import { api } from "../api";

/**
 * Signup redux action types.
 */
export enum SignupAction {
  StartSignup = "start_signup",
  FinishSignup = "finish_signup",
  FailSignup = "fail_signup",
}

/**
 * Creates a @see SignupAction.StartSignup action.
 * @internal
 */
export const startSignup = (): IEmptyAction<SignupAction.StartSignup> => ({
  type: SignupAction.StartSignup,
});

/**
 * Creates a @see SignupAction.FinishSignup action.
 * @param email The email used to signup
 * @internal
 */
export const finishSignup = (email: string): IAction<SignupAction.FinishSignup, string> => ({
  type: SignupAction.FinishSignup,
  value: email,
});

/**
 * Creates a @see SignupAction.FailSignup action.
 * @param error The error created during signup failure
 * @internal
 */
export const failSignup = (error: string): IAction<SignupAction.FailSignup, string> => ({
  type: SignupAction.FailSignup,
  value: error,
});

/**
 * Asynchronously signs the user up.
 * @param email The user's email
 * @param password The user's password
 */
export const signup = (email: string, password: string) => async (dispatch: Dispatch) => {
  dispatch(startSignup());

  try {
    const response = await api.signup(email, password);
    dispatch(finishSignup(response));
  } catch (error) {
    dispatch(failSignup(error.message));
  }
};
