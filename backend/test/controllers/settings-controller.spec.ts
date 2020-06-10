import { SettingsController } from "../../src/controllers/settings-controller";
import { Settings } from "../../src/entities/settings";
import { ISettingsService } from "../../src/services/settings-service";
import { MockedService } from "../services/mock";
import { MockSettingsService } from "../services/mock/mock-settings-service";

describe("SettingsController", () => {
  let service: MockedService<ISettingsService>;
  let controller: SettingsController;

  beforeEach(async () => {
    service = new MockSettingsService();
    controller = new SettingsController(service.instance);
  });

  it("gets all settings", async () => {
    expect.assertions(1);

    const value = new Settings();
    service.mocks.getSettings.mockResolvedValue(value);

    const settings = await controller.getSettings();
    expect(settings).toBe(value);
  });

  it("updates settings", async () => {
    expect.assertions(1);

    const settings = new Settings();
    await controller.updateSettings({ data: settings });
    expect(service.mocks.updateSettings).toBeCalledWith(settings);
  });
});
