import { MockedService } from ".";
import { IQuestionGraphService } from "../../../src/services/question-service";

/**
 * A mocked question graph service.
 */
export const MockQuestionGraphService = jest.fn(
  () =>
    new MockedService<IQuestionGraphService>({
      bootstrap: jest.fn(),
      buildQuestionGraph: jest.fn(),
    }),
);
