import { Dispatch } from "redux";
import { IAction, IEmptyAction } from ".";

/**
 * Request action types.
 */
export enum RequestAction {
  StartRequest = "start_request",
  FinishRequest = "finish_request",
  FailRequest = "fail_request",
}

/**
 * Creates a @see RequestAction.StartRequest action.
 */
export const startRequest = (): IEmptyAction<RequestAction.StartRequest> => ({
  type: RequestAction.StartRequest,
});

/**
 * Creates a @see RequestAction.FinishRequest action.
 */
export const finishRequest = (): IEmptyAction<RequestAction.FinishRequest> => ({
  type: RequestAction.FinishRequest,
});

/**
 * Creates a @see RequestAction.FailRequest action.
 * @param error The error that occurreed during the request
 */
export const failRequest = (error: string): IAction<RequestAction.FailRequest, string> => ({
  type: RequestAction.FailRequest,
  value: error,
});

/**
 * Asynchronously performs the given action as a request.
 * @param action An async action to perform as a request
 */
export const performRequest = (action: (dispatch: Dispatch) => Promise<void>) => async (dispatch: Dispatch) => {
  dispatch(startRequest());

  try {
    await action(dispatch);
    dispatch(finishRequest());
  } catch (error) {
    dispatch(failRequest(error.message));
  }
};
