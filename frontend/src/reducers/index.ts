import { combineReducers } from "redux";
import { IState } from "../state";
import { formReducer } from "./form";
import { requestReducer } from "./request";
import { roleReducer } from "./role";
import { settingsReducer } from "./settings";

/**
 * The app's root reducer.
 */
export const rootReducer = combineReducers<IState>({
  form: formReducer,
  request: requestReducer,
  role: roleReducer,
  settings: settingsReducer,
});
