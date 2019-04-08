import { IActionReturnTypes } from "../actions";
import * as signupActions from "../actions/signup";
import { SignupAction } from "../actions/signup";
import { IState } from "../state";

type IStateType = IState["signup"];
type IActionType = IActionReturnTypes<typeof signupActions>;

/**
 * The initial signup state.
 */
export const initialSettingsState: IStateType = {
  data: "",
  error: "",
  fetchInProgress: false,
};

/**
 * The signup reducer.
 * @param state The current state
 * @param action The current action
 */
export const signupReducer = (state: IStateType = initialSettingsState, action: IActionType): IStateType => {
  switch (action.type) {
    case SignupAction.StartSignup:
      return {
        ...state,
        fetchInProgress: true,
      };

    case SignupAction.FinishSignup:
      return {
        ...state,
        data: action.value,
        fetchInProgress: false,
      };

    case SignupAction.FailSignup:
      return {
        ...state,
        error: action.value,
        fetchInProgress: false,
      };

    default:
      return state;
  }
};
