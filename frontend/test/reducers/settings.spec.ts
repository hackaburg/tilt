import { failReceiveSettings, receiveSettings, startFetchSettings } from "../../src/actions/settings";
import { settingsReducer } from "../../src/reducers/settings";

describe("settingsReducer", () => {
  it("provides initial state", () => {
    const state = settingsReducer(undefined, {} as any);
    expect(state).toBeDefined();
  });

  it("sets the in progress field on fetch start", () => {
    const action = startFetchSettings();
    const state = settingsReducer({
      data: null as any,
      error: "",
      fetchInProgress: false,
    }, action);

    expect(state.fetchInProgress).toBeTruthy();
  });

  it("sets the in progress field and data on fetch receive", () => {
    const settings: any = {};
    const action = receiveSettings(settings);
    const state = settingsReducer({
      data: null as any,
      error: "",
      fetchInProgress: true,
    }, action);

    expect(state.fetchInProgress).toBeFalsy();
    expect(state.data).toBe(settings);
  });

  it("sets the in progress field and error on fetch failure", () => {
    const error = "error";
    const action = failReceiveSettings(error);
    const state = settingsReducer({
      data: null as any,
      error: "",
      fetchInProgress: true,
    }, action);

    expect(state.fetchInProgress).toBeFalsy();
    expect(state.error).toBe(error);
  });
});
