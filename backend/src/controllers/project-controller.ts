import { Authorized, Delete, JsonController, NotFoundError, Put, Param, Body, CurrentUser } from "routing-controllers";
import { Inject } from "typedi";
import { UserRole } from "../entities/user-role";
import { IProjectService, ProjectServiceToken } from "../services/project-service";
import { ProjectDTO, convertBetweenEntityAndDTO } from "./dto";
import { Project } from "../entities/project";
import { User } from "../entities/user";

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
    @CurrentUser() user: User,
  ): Promise<ProjectDTO> {
    // TODO ProjectUpdateDTO?
    const existing = await this._projects.getProjectByID(projectId);

    if (existing == null) {
      throw new NotFoundError();
    }

    const project = convertBetweenEntityAndDTO(projectDTO, Project);
    const updatedProject = await this._projects.updateProject(project, user);
    return convertBetweenEntityAndDTO(updatedProject, ProjectDTO);
  }
}
