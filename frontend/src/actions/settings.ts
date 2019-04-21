import { Dispatch } from "redux";
import { IAction } from ".";
import { IEmailSettings, IEmailTemplates, ISettings } from "../../../types/settings";
import { api } from "../api";
import { notifyChangesSaved } from "./notify";
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

/**
 * Asynchronously update email settings.
 * @param settings The settings to update
 */
export const updateEmailSettings = (settings: Partial<IEmailSettings>) => performRequest(async (dispatch: Dispatch) => {
  await api.updateEmailSettings(settings);
  notifyChangesSaved()(dispatch);
});

/**
 * Asynchronously update email templates.
 * @param templates The templates to update
 */
export const updateEmailTemplates = (templates: Partial<IEmailTemplates>) => performRequest(async (dispatch: Dispatch) => {
  await api.updateEmailTemplates(templates);
  notifyChangesSaved()(dispatch);
});
