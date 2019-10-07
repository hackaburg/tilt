import { IActionReturnTypes } from "../actions";
import * as roleActions from "../actions/role";
import { RoleAction } from "../actions/role";
import { IState } from "../state";

type IStateType = IState["role"];
type IActionType = IActionReturnTypes<typeof roleActions>;

/**
 * The initial settings state.
 */
export const initialSettingsState: IStateType = null;

/**
 * The role reducer.
 * @param state The current state
 * @param action The current action
 */
export const roleReducer = (
  state: IStateType = initialSettingsState,
  action: IActionType,
): IStateType => {
  switch (action.type) {
    case RoleAction.SetRole:
      return action.value;

    default:
      return state;
  }
};
