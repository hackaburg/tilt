import { MockedService } from ".";
import { IRatingService } from "../../../src/services/rating-service";

/**
 * A mocked rating service.
 */
export const MockRatingService = jest.fn(
  () =>
    new MockedService<IRatingService>({
      bootstrap: jest.fn(),
      getUsersRatingsForProject: jest.fn(),
      upsertRating: jest.fn(),
      getRatingByID: jest.fn(),
      deleteRatingByID: jest.fn(),
      getRatingResults: jest.fn(),
    }),
);
