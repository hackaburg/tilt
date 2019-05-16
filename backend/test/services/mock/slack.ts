import { MockedService } from ".";
import { ISlackNotificationService } from "../../../src/services/slack";

export const MockSlackNotificationService = jest.fn(() => (
  new MockedService<ISlackNotificationService>({
    bootstrap: jest.fn(),
    sendMessage: jest.fn(),
  })
));
