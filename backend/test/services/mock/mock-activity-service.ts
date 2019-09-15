import { IActivityService } from "../../../src/services/activity-service";
import { MockedService } from ".";

export const MockActivityService = jest.fn(() =>
  new MockedService<IActivityService>({
    addActivity: jest.fn(),
    bootstrap: jest.fn(),
    getActivities: jest.fn(),
  })
);
