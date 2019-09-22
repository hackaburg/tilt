import { failRequest, finishRequest, startRequest } from "../../src/actions/request";
import { initialRequestCollectionState, requestReducer } from "../../src/reducers/request";
import { RequestTarget } from "../../src/state";

describe("requestReducer", () => {
  it("provides initial state", () => {
    const state = requestReducer(undefined, {} as any);
    expect(state).toBeDefined();
  });

  it("starts a request", () => {
    const target = RequestTarget.ApplicationSettings;
    const state = requestReducer(initialRequestCollectionState, startRequest(target));

    expect(state[target].requestInProgress).toBeTruthy();
  });

  it("finishes a request", () => {
    const target = RequestTarget.ApplicationSettings;
    const state = requestReducer({
      ...initialRequestCollectionState,
      [target]: {
        error: undefined,
        requestInProgress: true,
      },
    }, finishRequest(target));

    expect(state[target].requestInProgress).toBeFalsy();
  });

  it("adds an error and ends a request", () => {
    const target = RequestTarget.ApplicationSettings;
    const error = "error";
    const state = requestReducer({
      ...initialRequestCollectionState,
      [target]: {
        error: undefined,
        requestInProgress: true,
      },
    }, failRequest(target, error));

    expect(state[target].error).toBe(error);
    expect(state[target].requestInProgress).toBeFalsy();
  });
});
