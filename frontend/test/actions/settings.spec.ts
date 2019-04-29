import { advanceTo } from "jest-date-mock";
import { setFormType } from "../../src/actions/form";
import { finishRequest, startRequest } from "../../src/actions/request";
import { fetchSettings, setSettings, updateSettings } from "../../src/actions/settings";
import { FormType } from "../../src/state";
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

    expect(dispatch).toBeCalledWith(startRequest());
    expect(api.getSettings).toBeCalled();
    expect(dispatch).toBeCalledWith(setSettings(settings));
    expect(dispatch).toBeCalledWith(finishRequest());
  });

  it("asynchronously updates the settings", async () => {
    expect.assertions(3);

    const dispatch = jest.fn();
    const form = FormType.ApplicationSettings;
    const settings = {};
    const actions = updateSettings(form, settings);
    await actions(dispatch);

    expect(dispatch).toBeCalledWith(startRequest());
    expect(dispatch).toBeCalledWith(setFormType(form));
    expect(dispatch).toBeCalledWith(finishRequest());
  });
});
