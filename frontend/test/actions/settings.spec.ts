import { advanceTo } from "jest-date-mock";
import { finishRequest, startRequest } from "../../src/actions/request";
import {
  fetchSettings,
  setSettings,
  updateSettings,
} from "../../src/actions/settings";
import { RequestTarget } from "../../src/state";
import { api } from "../__mocks__/api";

describe("settings actions", () => {
  it("asynchronously fetches the settings", async () => {
    expect.assertions(4);
    advanceTo(new Date());

    const settings: any = {};
    api.getSettings.mockResolvedValue(settings);

    const dispatch = jest.fn();
    const actions = fetchSettings();
    await actions(dispatch);

    const target = RequestTarget.FetchSettings;
    expect(dispatch).toBeCalledWith(startRequest(target));
    expect(api.getSettings).toBeCalled();
    expect(dispatch).toBeCalledWith(setSettings(settings));
    expect(dispatch).toBeCalledWith(finishRequest(target));
  });

  it("asynchronously updates the settings", async () => {
    expect.assertions(2);

    const dispatch = jest.fn();
    const settings = {};
    const target = RequestTarget.ApplicationSettings;
    const actions = updateSettings(target, settings);
    await actions(dispatch);

    expect(dispatch).toBeCalledWith(startRequest(target));
    expect(dispatch).toBeCalledWith(finishRequest(target));
  });
});
