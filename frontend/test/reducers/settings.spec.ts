import { setSettings } from "../../src/actions/settings";
import { settingsReducer } from "../../src/reducers/settings";

describe("settingsReducer", () => {
  it("provides an initial state", () => {
    const state = settingsReducer(undefined, {} as any);
    expect(state).toBeDefined();
  });

  it("sets the settings", () => {
    const settings: any = {};
    const state = settingsReducer({} as any, setSettings(settings));
    expect(state).toEqual(settings);
  });
});
