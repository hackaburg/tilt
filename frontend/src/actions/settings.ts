import { Dispatch } from "redux";
import { IAction } from ".";
import { ISettings } from "../../../types/settings";
import { api } from "../api";
import { performRequest } from "./request";

/**
 * Settings redux action types.
 */
export enum SettingsAction {
  SetSettings = "set_settings",
}

/**
 * Creates a @see SettingsAction.SetSettings action.
 * @param settings The settings to set
 */
export const setSettings = (settings: ISettings): IAction<SettingsAction.SetSettings, ISettings> => ({
  type: SettingsAction.SetSettings,
  value: settings,
});

/**
 * Asynchronously fetches settings.
 */
export const fetchSettings = () => performRequest(async (dispatch: Dispatch) => {
  const settings = await api.getSettings();
  dispatch(setSettings(settings));
});
