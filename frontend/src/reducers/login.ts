import { IActionReturnTypes } from "../actions";
import * as loginActions from "../actions/login";
import { LoginAction } from "../actions/login";
import { IState } from "../state";

type IStateType = IState["login"];
type IActionType = IActionReturnTypes<typeof loginActions>;

/**
 * The initial signup state.
 */
export const initialSettingsState: IStateType = {
  data: "",
  error: "",
  fetchInProgress: false,
};

/**
 * The login reducer.
 * @param state The current state
 * @param action The current action
 */
export const loginReducer = (state: IStateType = initialSettingsState, action: IActionType): IStateType => {
  switch (action.type) {
    case LoginAction.StartLogin:
      return {
        ...state,
        fetchInProgress: true,
      };

    case LoginAction.FinishLogin:
      return {
        ...state,
        fetchInProgress: false,
      };

    case LoginAction.FailLogin:
      return {
        ...state,
        error: action.value,
        fetchInProgress: false,
      };

    default:
      return state;
  }
};
