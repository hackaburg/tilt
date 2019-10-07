import { IActionReturnTypes } from "../actions";
import * as settingsActions from "../actions/settings";
import { SettingsAction } from "../actions/settings";
import { IState } from "../state";

type IStateType = IState["settings"];
type IActionType = IActionReturnTypes<typeof settingsActions>;

/**
 * The initial settings state.
 */
export const initialSettingsState: IStateType = null;

/**
 * The settings reducer.
 * @param state The current state
 * @param action The current action
 */
export const settingsReducer = (
  state: IStateType = initialSettingsState,
  action: IActionType,
): IStateType => {
  switch (action.type) {
    case SettingsAction.SetSettings:
      return {
        ...action.value,
      };

    default:
      return state;
  }
};
