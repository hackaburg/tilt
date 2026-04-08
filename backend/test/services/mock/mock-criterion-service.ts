import { MockedService } from ".";
import { ICriterionService } from "../../../src/services/criterion-service";

/**
 * A mocked criteria service.
 */
export const MockCriterionService = jest.fn(
  () =>
    new MockedService<ICriterionService>({
      bootstrap: jest.fn(),
      getAllCriteria: jest.fn(),
      createCriterion: jest.fn(),
      updateCriterion: jest.fn(),
      getCriterionByID: jest.fn(),
      deleteCriterionByID: jest.fn(),
    }),
);
