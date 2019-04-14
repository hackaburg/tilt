import { Dispatch } from "redux";
import { isLoginTokenSet } from "../authentication";
import { fetchRole } from "./role";
import { fetchSettings } from "./settings";
import { refreshLoginToken } from "./token";

/**
 * Dispatches all actions on app boot.
 */
export const boot = () => async (dispatch: Dispatch) => {
  await fetchSettings()(dispatch);

  if (isLoginTokenSet()) {
    await fetchRole()(dispatch);
    await refreshLoginToken()(dispatch);
  }
};
