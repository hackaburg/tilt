import { combineReducers } from "redux";
import { IState } from "../state";
import { loginReducer } from "./login";
import { requestReducer } from "./request";
import { settingsReducer } from "./settings";
import { signupReducer } from "./signup";

/**
 * The app's root reducer.
 */
export const rootReducer = combineReducers<IState>({
  login: loginReducer,
  request: requestReducer,
  settings: settingsReducer,
  signup: signupReducer,
});
