import { Dispatch } from "redux";
import { api } from "../api";
import { FormType } from "../state";
import { setFormType } from "./form";
import { performRequest } from "./request";

/**
 * Asynchronously signs the user up.
 * @param email The user's email
 * @param password The user's password
 */
export const signup = (email: string, password: string) => performRequest(async (dispatch: Dispatch) => {
  dispatch(setFormType(FormType.Signup));
  await api.signup(email, password);
});
