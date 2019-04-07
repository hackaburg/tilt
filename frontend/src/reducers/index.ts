import { combineReducers } from "redux";
import { IState } from "../state";
import { settingsReducer } from "./settings";

/**
 * The app's root reducer.
 */
export const rootReducer = combineReducers<IState>({
  settings: settingsReducer,
});
