import { MockedService } from ".";
import { IProjectService } from "../../../src/services/project-service";

/**
 * A mocked project service.
 */
export const MockProjectService = jest.fn(
  () =>
    new MockedService<IProjectService>({
      bootstrap: jest.fn(),
      getAllProjects: jest.fn(),
      createProject: jest.fn(),
      updateProject: jest.fn(),
      getProjectByID: jest.fn(),
      deleteProjectByID: jest.fn(),
    }),
);
