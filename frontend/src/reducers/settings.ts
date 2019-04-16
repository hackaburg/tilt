import { IActionReturnTypes } from "../actions";
import * as settingsActions from "../actions/settings";
import { SettingsAction } from "../actions/settings";
import { IState } from "../state";

type IStateType = IState["settings"];
type IActionType = IActionReturnTypes<typeof settingsActions>;

const initialColor = "#333";

/**
 * The initial settings state.
 */
export const initialSettingsState: IStateType = {
  email: {
    templateForgotPassword: "",
    templateVerifyEmail: "",
  },
  frontend: {
    colorGradientEnd: initialColor,
    colorGradientStart: initialColor,
    colorLink: initialColor,
    colorLinkHover: initialColor,
    loginSignupImage: "",
    sidebarImage: "",
  },
};

/**
 * The settings reducer.
 * @param state The current state
 * @param action The current action
 */
export const settingsReducer = (state: IStateType = initialSettingsState, action: IActionType): IStateType => {
  switch (action.type) {
    case SettingsAction.SetSettings:
      return {
        ...action.value,
      };

    default:
      return state;
  }
};
