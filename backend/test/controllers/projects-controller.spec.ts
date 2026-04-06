import * as http from "http";
import { createExpressServer, useContainer } from "routing-controllers";
import { validate } from "class-validator";
import { plainToClass } from "class-transformer";
import { ProjectsController } from "../../src/controllers/projects-controller";
import { ProjectDTO, ProjectUpdateDTO } from "../../src/controllers/dto";
import { Project } from "../../src/entities/project";
import { User } from "../../src/entities/user";
import { UserRole } from "../../src/entities/user-role";
import { HttpService } from "../../src/services/http-service";
import { IProjectService } from "../../src/services/project-service";
import { IUserService } from "../../src/services/user-service";
import { MockedService } from "../services/mock";
import { MockProjectService } from "../services/mock/mock-project-service";
import { MockUserService } from "../services/mock/mock-user-service";

describe("ProjectsController", () => {
  let projectService: MockedService<IProjectService>;
  let controller: ProjectsController;

  beforeEach(() => {
    projectService = new MockProjectService();
    controller = new ProjectsController(projectService.instance);
  });

  it("updates projects", async () => {
    expect.assertions(4);

    const user = new User();

    const updateData: any = {
      // Don't send the id in the payload on purpose. It should take the id
      // from the url.
      title: "foo-title",
      description: "foo-desc",
      allowRating: true,
      image: "foo"
    }

    projectService.mocks.getProjectByID.mockResolvedValue({
      id: 3,
      title: "bar-title",
      description: "bar-desc",
      allowRating: true,
      image: "bar"
    });

    projectService.mocks.updateProject.mockResolvedValue(updateData);

    const result = await controller.updateProject(3, { data: updateData }, user);

    expect(result).toBeDefined();
    expect(result.title).toEqual("foo-title");
    expect(projectService.mocks.updateProject.mock.calls[0][0].id).toEqual(3);
    expect(projectService.mocks.updateProject.mock.calls[0][0].title).toEqual("foo-title");
  });
});
