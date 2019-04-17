import { SettingsController } from "../../src/controllers/settings";
import { EmailSettings } from "../../src/entities/email-settings";
import { Settings } from "../../src/entities/settings";
import { ISettingsService } from "../../src/services/settings";
import { MockedService } from "../services/mock";
import { MockSettingsService } from "../services/mock/settings";

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

    const settings = new EmailSettings();
    await controller.updateEmailSettings({ data: settings });
    expect(service.mocks.updateEmailSettings).toBeCalledWith(settings);
  });
});
