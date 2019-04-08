import { fetchSettings, receiveSettings, startFetchSettings } from "../../src/actions/settings";
import { StaticApi } from "../../src/api/static-api";

describe("settings actions", () => {
  const api = new StaticApi();

  it("asynchronously fetches the settings", async () => {
    expect.assertions(2);

    const settings = await api.getSettings();
    const dispatch = jest.fn();
    const actions = fetchSettings();
    await actions(dispatch);

    expect(dispatch).toBeCalledWith(startFetchSettings());
    expect(dispatch).toBeCalledWith(receiveSettings(settings));
  });
});
