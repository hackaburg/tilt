import { MockedService } from ".";
import { IDatabaseService } from "../../../src/services/database";

export const MockDatabaseService = jest.fn(() =>
  new MockedService<IDatabaseService>({
    bootstrap: jest.fn(),
    getRepository: jest.fn(),
  })
);
