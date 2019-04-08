import { Dispatch } from "redux";
import { api } from "../api";
import { FormType } from "../state";
import { resetFormType, setFormType } from "./form";
import { performRequest } from "./request";

/**
 * Asynchronously logs the user in.
 * @param email The user's email
 * @param password The user's password
 */
export const login = (email: string, password: string) => performRequest(async (dispatch: Dispatch) => {
  dispatch(setFormType(FormType.Login));
  await api.login(email, password);
  dispatch(resetFormType());
});
