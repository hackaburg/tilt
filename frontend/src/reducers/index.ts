import { combineReducers } from "redux";
import { IState } from "../state";
import { settingsReducer } from "./settings";
import { signupReducer } from "./signup";

/**
 * The app's root reducer.
 */
export const rootReducer = combineReducers<IState>({
  settings: settingsReducer,
  signup: signupReducer,
});
