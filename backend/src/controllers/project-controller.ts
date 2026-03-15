import { Authorized, Delete, JsonController, NotFoundError } from "routing-controllers";
import { Inject } from "typedi";
import { UserRole } from "../entities/user-role";
import { IProjectService, ProjectServiceToken } from "../services/project-service";

// TODO for every team, add a new project automatically with the correct teamId

@JsonController("/projects")
export class ProjectController {
  public constructor(
    @Inject(ProjectServiceToken) private readonly _projects: IProjectService,
  ) {}

  /**
   * Update a project (mvp: create one project per team)
   */
  @Put("/project/:id")
  @Authorized(UserRole.User)
  public async updateProject(
    @Param("id") projectId: number,
    @Body() { data: projectDTO }: { data: ProjectDTO },
  ): Promise<TeamDTO> {
    // TODO ProjectUpdateDTO?
    const project = convertBetweenEntityAndDTO(projectDTO, Project);

    // TODO how to make actual not found errors for incorrect ids?

    const updateProject = await this._ratings.updateProject(project, user);
    return convertBetweenEntityAndDTO(updateProject, ProjectDTO);
  }
}
