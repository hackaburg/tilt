import { failLogin, finishLogin, startLogin } from "../../src/actions/login";
import { loginReducer } from "../../src/reducers/login";

describe("loginReducer", () => {
  it("provides initial state", () => {
    const state = loginReducer(undefined, {} as any);
    expect(state).toBeDefined();
  });

  it("sets the in progress field on login start", () => {
    const action = startLogin();
    const state = loginReducer({
      data: null as any,
      error: "",
      fetchInProgress: false,
    }, action);

    expect(state.fetchInProgress).toBeTruthy();
  });

  it("sets the in progress field on login finish", () => {
    const action = finishLogin();
    const state = loginReducer({
      data: null as any,
      error: "",
      fetchInProgress: true,
    }, action);

    expect(state.fetchInProgress).toBeFalsy();
  });

  it("sets the in progress field and error on login failure", () => {
    const error = "error";
    const action = failLogin(error);
    const state = loginReducer({
      data: null as any,
      error: "",
      fetchInProgress: true,
    }, action);

    expect(state.fetchInProgress).toBeFalsy();
    expect(state.error).toBe(error);
  });
});
