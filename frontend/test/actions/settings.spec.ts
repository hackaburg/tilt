import { finishRequest, startRequest } from "../../src/actions/request";
import { fetchSettings, setSettings } from "../../src/actions/settings";
import { StaticApi } from "../../src/api/static-api";

describe("settings actions", () => {
  const api = new StaticApi();

  it("asynchronously fetches the settings", async () => {
    expect.assertions(3);

    const settings = await api.getSettings();
    const dispatch = jest.fn();
    const actions = fetchSettings();
    await actions(dispatch);

    expect(dispatch).toBeCalledWith(startRequest());
    expect(dispatch).toBeCalledWith(setSettings(settings));
    expect(dispatch).toBeCalledWith(finishRequest());
  });
});
