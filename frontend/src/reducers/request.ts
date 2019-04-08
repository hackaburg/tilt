import { IActionReturnTypes } from "../actions";
import * as requestActions from "../actions/request";
import { RequestAction } from "../actions/request";
import { IState } from "../state";

type IStateType = IState["request"];
type IActionType = IActionReturnTypes<typeof requestActions>;

/**
 * The initial request state.
 */
export const initialSettingsState: IStateType = {
  requestInProgress: false,
};

/**
 * The request reducer.
 * @param state The current state
 * @param action The current action
 */
export const requestReducer = (state: IStateType = initialSettingsState, action: IActionType): IStateType => {
  switch (action.type) {
    case RequestAction.StartRequest:
      return {
        ...state,
        error: undefined,
        requestInProgress: true,
      };

    case RequestAction.FinishRequest:
      return {
        ...state,
        error: undefined,
        requestInProgress: false,
      };

    case RequestAction.FailRequest:
      return {
        ...state,
        error: action.value,
        requestInProgress: false,
      };

    default:
      return state;
  }
};
