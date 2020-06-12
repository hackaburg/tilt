import { SettingsDTO } from "../../src/controllers/dto";
import { SettingsController } from "../../src/controllers/settings-controller";
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

    const value = new SettingsDTO();
    service.mocks.getSettings.mockResolvedValue(value);

    const settings = await controller.getSettings();
    expect(settings).toMatchObject(value);
  });

  it("updates settings", async () => {
    expect.assertions(1);

    const settings = new SettingsDTO();
    await controller.updateSettings({ data: settings });
    expect(service.mocks.updateSettings).toBeCalledWith(settings);
  });
});
