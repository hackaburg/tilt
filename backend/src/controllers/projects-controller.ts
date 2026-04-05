import { Authorized, Get, JsonController, NotFoundError, Put, Param, Body, CurrentUser } from "routing-controllers";
import { Inject } from "typedi";
import { UserRole } from "../entities/user-role";
import { IProjectService, ProjectServiceToken } from "../services/project-service";
import { ProjectDTO, convertBetweenEntityAndDTO } from "./dto";
import { Project } from "../entities/project";
import { User } from "../entities/user";

@JsonController("/projects")
export class ProjectsController {
  public constructor(
    @Inject(ProjectServiceToken) private readonly _projects: IProjectService,
  ) {}

  /**
   * Get all projects.
   */
  @Get("/")
  @Authorized(UserRole.User)
  public async getAllProjects(
    @CurrentUser() user: User,
  ): Promise<ProjectDTO[]> {
    const projects = await this._projects.getAllProjects(user);
    return projects.map((p) => convertBetweenEntityAndDTO(p, ProjectDTO));
  }

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
    const existing = await this._projects.getProjectByID(projectId);

    if (existing == null) {
      throw new NotFoundError();
    }

    const project = convertBetweenEntityAndDTO(projectDTO, Project);
    const updatedProject = await this._projects.updateProject(project, user);
    return convertBetweenEntityAndDTO(updatedProject, ProjectDTO);
  }
}
