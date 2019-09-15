import { ActivityType, IActivityData } from "../../../types/activity";
import { UserRole } from "../../../types/roles";
import { IWebSocketActivityMessageData, WebSocketMessageType } from "../../../types/ws";
import { SettingsController } from "../../src/controllers/settings-controller";
import { Settings } from "../../src/entities/settings";
import { IActivityService } from "../../src/services/activity-service";
import { ISettingsService } from "../../src/services/settings-service";
import { IWebSocketService } from "../../src/services/ws-service";
import { toPrettyJson } from "../../src/utils/json";
import { MockedService } from "../services/mock";
import { MockActivityService } from "../services/mock/mock-activity-service";
import { MockSettingsService } from "../services/mock/mock-settings-service";
import { MockWebSocketService } from "../services/mock/mock-ws-service";

describe("SettingsController", () => {
  let activityService: MockedService<IActivityService>;
  let wsService: MockedService<IWebSocketService>;
  let service: MockedService<ISettingsService>;
  let controller: SettingsController;

  beforeEach(async () => {
    activityService = new MockActivityService();
    wsService = new MockWebSocketService();
    service = new MockSettingsService();
    controller = new SettingsController(service.instance, activityService.instance, wsService.instance);
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
      next: toPrettyJson(nextSettings),
      previous: toPrettyJson(previousSettings),
      type: ActivityType.SettingsUpdate,
    } as IActivityData);
  });

  it("broadcasts settings updates to moderators", async () => {
    expect.assertions(1);

    const activity = "activity" as any;
    activityService.mocks.addActivity.mockResolvedValue(activity);

    await controller.updateSettings(null as any, { data: null as any });

    const data: IWebSocketActivityMessageData = {
      activity: [
        activity,
      ],
      type: WebSocketMessageType.Activity,
    };

    expect(wsService.mocks.broadcast).toBeCalledWith(UserRole.Moderator, data);
  });
});
