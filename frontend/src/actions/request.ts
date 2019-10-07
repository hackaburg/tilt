import { Dispatch } from "redux";
import { IAction } from ".";
import { RequestTarget } from "../state";

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
export const startRequest = (
  target: RequestTarget,
): IAction<RequestAction.StartRequest, RequestTarget> => ({
  type: RequestAction.StartRequest,
  value: target,
});

/**
 * Creates a @see RequestAction.FinishRequest action.
 */
export const finishRequest = (
  target: RequestTarget,
): IAction<RequestAction.FinishRequest, RequestTarget> => ({
  type: RequestAction.FinishRequest,
  value: target,
});

interface IFailedRequest {
  error: string;
  target: RequestTarget;
}

/**
 * Creates a @see RequestAction.FailRequest action.
 * @param error The error that occurreed during the request
 */
export const failRequest = (
  target: RequestTarget,
  error: string,
): IAction<RequestAction.FailRequest, IFailedRequest> => ({
  type: RequestAction.FailRequest,
  value: {
    error,
    target,
  },
});

/**
 * Asynchronously performs the given action as a request.
 * @param action An async action to perform as a request
 */
export const performRequest = (
  target: RequestTarget,
  action: (dispatch: Dispatch) => Promise<void>,
) => async (dispatch: Dispatch) => {
  dispatch(startRequest(target));

  try {
    await action(dispatch);
    dispatch(finishRequest(target));
  } catch (error) {
    dispatch(failRequest(target, error.message));
  }
};
