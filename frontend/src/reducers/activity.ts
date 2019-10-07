import { IActionReturnTypes } from "../actions";
import * as activityActions from "../actions/activity";
import { ActivityAction } from "../actions/activity";
import { IState } from "../state";

type IStateType = IState["activity"];
type IActionType = IActionReturnTypes<typeof activityActions>;

/**
 * The initial activities state - null.
 */
export const initialActivitiesState: IStateType = null;

/**
 * The activities reducer.
 * @param state The current state
 * @param action The current action
 */
export const activityReducer = (
  state: IStateType = initialActivitiesState,
  action: IActionType,
): IStateType => {
  switch (action.type) {
    case ActivityAction.AddActivities:
      return [...(state || []), ...action.value];

    default:
      return state;
  }
};
