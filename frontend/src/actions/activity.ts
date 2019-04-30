import { Dispatch } from "redux";
import { IAction } from ".";
import { IActivity } from "../../../types/activity";
import { api } from "../api";
import { performRequest } from "./request";

/**
 * Activity redux actions.
 */
export enum ActivityAction {
  AddActivities = "add_activities",
}

/**
 * Creates an @see ActivityAction.AddActivities action with the given activities.
 * @param activities Activities to add
 */
export const addActivities = (activities: IActivity[]): IAction<ActivityAction.AddActivities, IActivity[]> => ({
  type: ActivityAction.AddActivities,
  value: activities,
});

/**
 * Asynchronously fetches the latest activity.
 */
export const fetchActivities = () => performRequest(async (dispatch: Dispatch) => {
  const activity = await api.getActivities();
  dispatch(addActivities(activity));
});
