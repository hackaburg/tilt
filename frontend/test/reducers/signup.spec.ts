import { failSignup, finishSignup, startSignup } from "../../src/actions/signup";
import { signupReducer } from "../../src/reducers/signup";

describe("signupReducer", () => {
  it("provides initial state", () => {
    const state = signupReducer(undefined, {} as any);
    expect(state).toBeDefined();
  });

  it("sets the in progress field on signup start", () => {
    const action = startSignup();
    const state = signupReducer({
      data: null as any,
      error: "",
      fetchInProgress: false,
    }, action);

    expect(state.fetchInProgress).toBeTruthy();
  });

  it("sets the in progress field and data on signup finish", () => {
    const response = "test";
    const action = finishSignup(response);
    const state = signupReducer({
      data: null as any,
      error: "",
      fetchInProgress: true,
    }, action);

    expect(state.fetchInProgress).toBeFalsy();
    expect(state.data).toBe(response);
  });

  it("sets the in progress field and error on signup failure", () => {
    const error = "error";
    const action = failSignup(error);
    const state = signupReducer({
      data: null as any,
      error: "",
      fetchInProgress: true,
    }, action);

    expect(state.fetchInProgress).toBeFalsy();
    expect(state.error).toBe(error);
  });
});
