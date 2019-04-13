import { Dispatch } from "redux";
import { IAction } from ".";
import { UserRole } from "../../../types/roles";
import { api } from "../api";
import { performRequest } from "./request";

/**
 * Role redux actions.
 */
export enum RoleAction {
  SetRole = "set_role",
}

/**
 * Creates an @see RoleAction.SetRole action.
 * @param role The role to set
 */
export const setRole = (role: UserRole): IAction<RoleAction.SetRole, UserRole> => ({
  type: RoleAction.SetRole,
  value: role,
});

/**
 * Asynchronously fetches the user's role.
 */
export const fetchRole = () => performRequest(async (dispatch: Dispatch) => {
  try {
    const role = await api.getRole();
    dispatch(setRole(role));
  } catch {
    // user is probably not logged in, ignore
  }
});
