import { Tilt } from "../../src/services/tilt-service";
import { MockedService } from "./mock";
import { MockAnswerService } from "./mock/mock-answer-service";
import { MockBootShutdownNotifier } from "./mock/mock-boot-shutdown-notification-service";
import { MockConfigurationService } from "./mock/mock-config-service";
import { MockDatabaseService } from "./mock/mock-database-service";
import { MockEmailService } from "./mock/mock-email-service";
import { MockEmailTemplateService } from "./mock/mock-email-template-service";
import { MockHaveibeenpwnedService } from "./mock/mock-haveibeenpwned-service";
import { MockHttpService } from "./mock/mock-http-service";
import { MockLoggerService } from "./mock/mock-logger-service";
import { MockQuestionGraphService } from "./mock/mock-question-graph-service";
import { MockSettingsService } from "./mock/mock-settings-service";
import { MockSlackNotificationService } from "./mock/mock-slack-service";
import { MockTokenService } from "./mock/mock-token-service";
import { MockUnixSignalService } from "./mock/mock-unix-signal-service";
import { MockUserService } from "./mock/mock-user-service";

describe("TiltService", () => {
  it("bootstraps all services", async () => {
    const services: Array<MockedService<any>> = [];
    const addService = <T extends MockedService<any>>(service: T) => {
      services.push(service);
      return service;
    };

    const signals = addService(new MockUnixSignalService());
    const logger = addService(new MockLoggerService());
    const config = addService(new MockConfigurationService({}));
    const database = addService(new MockDatabaseService());
    const users = addService(new MockUserService());
    const http = addService(new MockHttpService());
    const tokens = addService(new MockTokenService());
    const settings = addService(new MockSettingsService());
    const questions = addService(new MockQuestionGraphService());
    const answers = addService(new MockAnswerService());
    const email = addService(new MockEmailService());
    const haveibeenpwned = addService(new MockHaveibeenpwnedService());
    const emailTemplates = addService(new MockEmailTemplateService());
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
      tokens.instance,
      users.instance,
      settings.instance,
      questions.instance,
      answers.instance,
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
