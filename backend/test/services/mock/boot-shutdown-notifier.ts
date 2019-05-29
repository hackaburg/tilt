import { MockedService } from ".";
import { IBootShutdownNotificationService } from "../../../src/services/boot-shutdown-notifier";

export const MockBootShutdownNotifier = jest.fn(() => (
  new MockedService<IBootShutdownNotificationService>({
    bootstrap: jest.fn(),
  })
));
