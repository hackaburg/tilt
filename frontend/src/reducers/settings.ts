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
  data: {
    frontend: {
      colorGradientEnd: initialColor,
      colorGradientStart: initialColor,
      colorLink: initialColor,
      colorLinkHover: initialColor,
      loginImage: "http://placehold.it/300x300",
      signupImage: "http://placehold.it/300x300",
    },
  },
  error: "",
  fetchInProgress: false,
};

/**
 * The settings reducer.
 * @param state The current state
 * @param action The current action
 */
export const settingsReducer = (state: IStateType = initialSettingsState, action: IActionType): IStateType => {
  switch (action.type) {
    case SettingsAction.StartFetchSettings:
      return {
        ...state,
        fetchInProgress: true,
      };

    case SettingsAction.ReceiveSettings:
      return {
        ...state,
        data: action.value,
      };

    case SettingsAction.FailReceiveSettings:
      return {
        ...state,
        error: action.value,
      };

    default:
      return state;
  }
};
