import { MockedService } from ".";
import { IBootShutdownNotificationService } from "../../../src/services/boot-shutdown-notification-service";

/**
 * A mocked boot shutdown notifier service.
 */
export const MockBootShutdownNotifier = jest.fn(
  () =>
    new MockedService<IBootShutdownNotificationService>({
      bootstrap: jest.fn(),
    }),
);
