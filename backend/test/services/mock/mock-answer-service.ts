import { MockedService } from ".";
import { IAnswerService } from "../../../src/services/answer-service";

/**
 * A mocked answer service.
 */
export const MockAnswerService = jest.fn(
  () =>
    new MockedService<IAnswerService>({
      bootstrap: jest.fn(),
      getAnswersForUser: jest.fn(),
      storeAnswers: jest.fn(),
    }),
);
