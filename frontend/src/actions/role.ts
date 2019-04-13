import { IAction } from ".";
import { UserRole } from "../../../types/roles";

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
