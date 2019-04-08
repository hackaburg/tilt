import { combineReducers } from "redux";
import { IState } from "../state";
import { loginReducer } from "./login";
import { settingsReducer } from "./settings";
import { signupReducer } from "./signup";

/**
 * The app's root reducer.
 */
export const rootReducer = combineReducers<IState>({
  login: loginReducer,
  settings: settingsReducer,
  signup: signupReducer,
});
