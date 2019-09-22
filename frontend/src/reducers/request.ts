import { IActionReturnTypes } from "../actions";
import * as requestActions from "../actions/request";
import { RequestAction } from "../actions/request";
import { IState, RequestTarget } from "../state";

type IStateType = IState["request"];
type IActionType = IActionReturnTypes<typeof requestActions>;

/**
 * The initial request state.
 */
export const initialRequestCollectionState: IStateType =
  Object
    .values(RequestTarget)
    .reduce((state, target) => {
      state[target as RequestTarget] = {
        error: undefined,
        requestInProgress: false,
      };
      return state;
    }, {} as IStateType);

/**
 * The request reducer.
 * @param state The current state
 * @param action The current action
 */
export const requestReducer = (state: IStateType = initialRequestCollectionState, action: IActionType): IStateType => {
  switch (action.type) {
    case RequestAction.StartRequest:
      return {
        ...state,
        [action.value]: {
          error: undefined,
          requestInProgress: true,
        },
      };

    case RequestAction.FinishRequest:
      return {
        ...state,
        [action.value]: {
          error: undefined,
          requestInProgress: false,
        },
      };

    case RequestAction.FailRequest:
      return {
        ...state,
        [action.value.target]: {
          error: action.value.error,
          requestInProgress: false,
        },
      };

    default:
      return state;
  }
};
