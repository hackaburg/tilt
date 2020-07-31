import { MockedService } from ".";
import { IApplicationService } from "../../../src/services/application-service";

/**
 * A mocked application service.
 */
export const MockApplicationService = jest.fn(
  () =>
    new MockedService<IApplicationService>({
      admit: jest.fn(),
      bootstrap: jest.fn(),
      getConfirmationForm: jest.fn(),
      getProfileForm: jest.fn(),
      storeConfirmationFormAnswers: jest.fn(),
      storeProfileFormAnswers: jest.fn(),
    }),
);
