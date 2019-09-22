import { Dispatch } from "redux";
import { api } from "../api";
import { clearLoginToken } from "../authentication";
import { RequestTarget } from "../state";
import { performRequest } from "./request";
import { setRole } from "./role";

/**
 * Asynchronously logs the user in.
 * @param email The user's email
 * @param password The user's password
 */
export const login = (email: string, password: string) => performRequest(RequestTarget.Login, async (dispatch: Dispatch) => {
  const role = await api.login(email, password);
  dispatch(setRole(role));
});

/**
 * Logs the user out.
 */
export const logout = () => async (dispatch: Dispatch) => {
  clearLoginToken();
  dispatch(setRole(null));
};
