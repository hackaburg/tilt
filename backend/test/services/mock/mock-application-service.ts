import { MockedService } from ".";
import { IApplicationService } from "../../../src/services/application-service";

/**
 * A mocked application service.
 */
export const MockApplicationService = jest.fn(
  () =>
    new MockedService<IApplicationService>({
      bootstrap: jest.fn(),
      getProfileForm: jest.fn(),
      storeProfileFormAnswers: jest.fn(),
    }),
);
