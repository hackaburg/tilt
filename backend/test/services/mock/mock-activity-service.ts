import { MockedService } from ".";
import { IActivityService } from "../../../src/services/activity-service";

/**
 * A mocked activity service.
 */
export const MockActivityService = jest.fn(() =>
  new MockedService<IActivityService>({
    addActivity: jest.fn(),
    bootstrap: jest.fn(),
    getActivities: jest.fn(),
  }),
);
