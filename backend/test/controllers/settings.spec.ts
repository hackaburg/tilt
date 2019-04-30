import { ActivityEvent } from "../../../types/activity";
import { SettingsController } from "../../src/controllers/settings";
import { Settings } from "../../src/entities/settings";
import { IActivityService } from "../../src/services/activity";
import { ISettingsService } from "../../src/services/settings";
import { MockedService } from "../services/mock";
import { MockActivityService } from "../services/mock/activity";
import { MockSettingsService } from "../services/mock/settings";

describe("SettingsController", () => {
  let activityService: MockedService<IActivityService>;
  let service: MockedService<ISettingsService>;
  let controller: SettingsController;

  beforeEach(async () => {
    activityService = new MockActivityService();
    service = new MockSettingsService();
    controller = new SettingsController(service.instance, activityService.instance);
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

    const user: any = {};
    const settings = new Settings();
    await controller.updateSettings(user, { data: settings });
    expect(service.mocks.updateSettings).toBeCalledWith(settings);
  });

  it("logs settings updates", async () => {
    expect.assertions(1);
    const user: any = {};
    const previousSettings = new Settings();
    const nextSettings = new Settings();

    service.mocks.getSettings.mockResolvedValue(previousSettings);
    service.mocks.updateSettings.mockResolvedValue(nextSettings);

    await controller.updateSettings(user, { data: nextSettings });
    expect(activityService.instance.addActivity).toBeCalledWith(user, {
      event: ActivityEvent.SettingsUpdate,
      next: nextSettings,
      previous: previousSettings,
    });
  });
});
