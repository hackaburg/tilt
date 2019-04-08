import { failRequest, finishRequest, startRequest } from "../../src/actions/request";
import { requestReducer } from "../../src/reducers/request";

describe("requestReducer", () => {
  it("provides initial state", () => {
    const state = requestReducer(undefined, {} as any);
    expect(state).toBeDefined();
  });

  it("starts a request", () => {
    const state = requestReducer({
      requestInProgress: false,
    }, startRequest());

    expect(state.requestInProgress).toBeTruthy();
  });

  it("finishes a request", () => {
    const state = requestReducer({
      requestInProgress: true,
    }, finishRequest());

    expect(state.requestInProgress).toBeFalsy();
  });

  it("adds an error and ends a request", () => {
    const error = "error";
    const state = requestReducer({
      requestInProgress: true,
    }, failRequest(error));

    expect(state.error).toBe(error);
    expect(state.requestInProgress).toBeFalsy();
  });
});
