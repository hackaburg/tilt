import { Tilt } from "../../src/services/tilt";
import { MockedService } from "./mock";
import { MockActivityService } from "./mock/activity";
import { MockBootShutdownNotifier } from "./mock/boot-shutdown-notifier";
import { MockConfigurationService } from "./mock/config";
import { MockDatabaseService } from "./mock/database";
import { MockEmailService } from "./mock/email";
import { MockEmailTemplateService } from "./mock/email-template";
import { MockHaveibeenpwnedService } from "./mock/haveibeenpwned";
import { MockHttpService } from "./mock/http";
import { MockLoggerService } from "./mock/logger";
import { MockSettingsService } from "./mock/settings";
import { MockSlackNotificationService } from "./mock/slack";
import { MockTokenService } from "./mock/tokens";
import { MockUnixSignalService } from "./mock/unix-signals";
import { MockUserService } from "./mock/users";
import { MockWebSocketService } from "./mock/ws";

describe("TiltService", () => {
  it("bootstraps all services", async () => {
    const services: Array<MockedService<any>> = [];
    const addService = <T extends MockedService<any>>(service: T) => {
      services.push(service);
      return service;
    };

    const signals = addService(new MockUnixSignalService());
    const logger = addService(new MockLoggerService());
    const config = addService(new MockConfigurationService({ }));
    const database = addService(new MockDatabaseService());
    const activity = addService(new MockActivityService());
    const users = addService(new MockUserService());
    const http = addService(new MockHttpService());
    const tokens = addService(new MockTokenService());
    const settings = addService(new MockSettingsService());
    const email = addService(new MockEmailService());
    const haveibeenpwned = addService(new MockHaveibeenpwnedService());
    const emailTemplates = addService(new MockEmailTemplateService());
    const ws = addService(new MockWebSocketService());
    const slack = addService(new MockSlackNotificationService());
    const bootShutdownNotifier = addService(new MockBootShutdownNotifier());

    const instances: ConstructorParameters<typeof Tilt> = [
      signals.instance,
      haveibeenpwned.instance,
      config.instance,
      logger.instance,
      slack.instance,
      bootShutdownNotifier.instance,
      database.instance,
      email.instance,
      emailTemplates.instance,
      activity.instance,
      tokens.instance,
      users.instance,
      settings.instance,
      ws.instance,
      http.instance,
    ];

    expect.assertions(instances.length);

    const tilt = new Tilt(...instances);
    await tilt.bootstrap();

    for (const { mocks } of services) {
      expect(mocks.bootstrap).toBeCalled();
    }
  });
});
