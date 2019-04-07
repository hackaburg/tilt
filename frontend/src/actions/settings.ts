import { Dispatch } from "redux";
import { IAction, IEmptyAction } from ".";
import { ISettings } from "../../../types/settings";
import { api } from "../api";

/**
 * Settings redux action types.
 */
export enum SettingsAction {
  StartFetchSettings = "start_fetch_settings",
  ReceiveSettings = "receive_settings",
  FailReceiveSettings = "fail_receive_settings",
}

/**
 * Creates a @see SettingsAction.StartFetchSettings action.
 * @internal
 */
export const startFetchSettings = (): IEmptyAction<SettingsAction.StartFetchSettings> => ({
  type: SettingsAction.StartFetchSettings,
});

/**
 * Creates a @see SettingsAction.ReceiveSettings action.
 * @param value The received settings
 * @internal
 */
export const receiveSettings = (value: ISettings): IAction<SettingsAction.ReceiveSettings, ISettings> => ({
  type: SettingsAction.ReceiveSettings,
  value,
});

/**
 * Creates a @see SettingsAction.FailReceiveSettings action.
 * @param error The error that occurred
 * @internal
 */
export const failReceiveSettings = (error: string): IAction<SettingsAction.FailReceiveSettings, string> => ({
  type: SettingsAction.FailReceiveSettings,
  value: error,
});

/**
 * Asynchronously fetches settings.
 */
export const fetchSettings = () => async (dispatch: Dispatch) => {
  dispatch(startFetchSettings());

  try {
    const settings = await api.getSettings();
    dispatch(receiveSettings(settings));
  } catch (error) {
    dispatch(failReceiveSettings(error.message));
  }
};
