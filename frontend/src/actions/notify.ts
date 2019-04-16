import { Dispatch } from "redux";
import { IAction, IEmptyAction } from ".";
import { notificationDuration } from "../config";
import { sleep } from "../util";

/**
 * Notification redux action types.
 */
export enum NotifyAction {
  ShowNotification = "show_notification",
  HideNotification = "hide_notification",
}

/**
 * Creates an @see NotifyAction.ShowNotification action.
 * @param text The text to display
 */
export const showNotification = (text: string): IAction<NotifyAction.ShowNotification, string> => ({
  type: NotifyAction.ShowNotification,
  value: text,
});

/**
 * Creates an @see NotifyAction.HideNotification action.
 */
export const hideNotification = (): IEmptyAction<NotifyAction.HideNotification> => ({
  type: NotifyAction.HideNotification,
});

/**
 * Asynchronously notifies the user about the given message.
 * @param text The text to display
 */
export const notify = (text: string) => async (dispatch: Dispatch) => {
  dispatch(showNotification(text));
  await sleep(notificationDuration);
  dispatch(hideNotification());
};
