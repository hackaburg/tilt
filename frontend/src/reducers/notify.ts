import { IActionReturnTypes } from "../actions";
import * as notifyActions from "../actions/notify";
import { NotifyAction } from "../actions/notify";
import { IState } from "../state";

type IStateType = IState["notification"];
type IActionType = IActionReturnTypes<typeof notifyActions>;

/**
 * The initial notification state.
 */
export const initialNotificationState: IStateType = {
  show: false,
  text: "",
};

/**
 * The settings reducer.
 * @param state The current state
 * @param action The current action
 */
export const notifyReducer = (
  state: IStateType = initialNotificationState,
  action: IActionType,
): IStateType => {
  switch (action.type) {
    case NotifyAction.ShowNotification:
      return {
        show: true,
        text: action.value,
      };

    case NotifyAction.HideNotification:
      return {
        ...state,
        show: false,
      };

    default:
      return state;
  }
};
