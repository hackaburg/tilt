import { IActionReturnTypes } from "../actions";
import * as formActions from "../actions/form";
import { FormAction } from "../actions/form";
import { FormType, IState } from "../state";

type IStateType = IState["form"];
type IActionType = IActionReturnTypes<typeof formActions>;

/**
 * The initial form state.
 */
export const initialSettingsState: IStateType = {
  type: FormType.None,
};

/**
 * The form reducer.
 * @param state The current state
 * @param action The current action
 */
export const formReducer = (state: IStateType = initialSettingsState, action: IActionType): IStateType => {
  switch (action.type) {
    case FormAction.SetType:
      return {
        ...state,
        type: action.value,
      };

    default:
      return state;
  }
};
