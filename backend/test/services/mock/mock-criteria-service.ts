import { MockedService } from ".";
import { ICriteriaService } from "../../../src/services/criteria-service";

/**
 * A mocked criteria service.
 */
export const MockCriteriaService = jest.fn(
  () =>
    new MockedService<ICriteriaService>({
      bootstrap: jest.fn(),
      getAllCriterias: jest.fn(),
      createCriteria: jest.fn(),
      updateCriteria: jest.fn(),
      getCriteriaByID: jest.fn(),
      deleteCriteriaByID: jest.fn(),
    }),
);
