import { Tilt } from "../../src/services/tilt";
import { MockedService } from "./mock";
import { MockActivityService } from "./mock/activity";
import { MockConfigurationService } from "./mock/config";
import { MockDatabaseService } from "./mock/database";
import { MockEmailService } from "./mock/email";
import { MockEmailTemplateService } from "./mock/email-template";
import { MockHaveibeenpwnedService } from "./mock/haveibeenpwned";
import { MockHttpService } from "./mock/http";
import { MockLoggerService } from "./mock/logger";
import { MockSettingsService } from "./mock/settings";
import { MockTokenService } from "./mock/tokens";
import { MockUserService } from "./mock/users";

describe("TiltService", () => {
  it("bootstraps all services", async () => {
    const services: Array<MockedService<any>> = [];
    const addService = <T extends MockedService<any>>(service: T) => {
      services.push(service);
      return service;
    };

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

    const instances: ConstructorParameters<typeof Tilt> = [
      haveibeenpwned.instance,
      config.instance,
      logger.instance,
      database.instance,
      email.instance,
      emailTemplates.instance,
      activity.instance,
      tokens.instance,
      users.instance,
      settings.instance,
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
