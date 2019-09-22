import { combineReducers } from "redux";
import { IState } from "../state";
import { activityReducer } from "./activity";
import { notifyReducer } from "./notify";
import { requestReducer } from "./request";
import { roleReducer } from "./role";
import { settingsReducer } from "./settings";

/**
 * The app's root reducer.
 */
export const rootReducer = combineReducers<IState>({
  activity: activityReducer,
  notification: notifyReducer,
  request: requestReducer,
  role: roleReducer,
  settings: settingsReducer,
});
