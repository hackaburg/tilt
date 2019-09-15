import { MockedService } from ".";
import { ISlackNotificationService } from "../../../src/services/slack-service";

export const MockSlackNotificationService = jest.fn(() => (
  new MockedService<ISlackNotificationService>({
    bootstrap: jest.fn(),
    sendMessage: jest.fn(),
  })
));
