import { Inject, Service, Token } from "typedi";
import { Repository } from "typeorm";
import { IService } from ".";
import { DatabaseServiceToken, IDatabaseService } from "./database-service";
import { Project } from "../entities/project";
import {
  ProjectResponseDTO,
  convertBetweenEntityAndDTO,
} from "../controllers/dto";
import { User } from "../entities/user";

/**
 * An interface describing user handling.
 */
export interface IProjectService extends IService {
  /**
   * Get all projects
   */
  getAllProjects(): Promise<readonly Project[]>;
  /**
   * Create new project
   */
  createProject(project: Project): Promise<Project>;
  /**
   *  Update project
   */
  updateProject(project: Project, user: User): Promise<Project>;
  /**
   * Get project by id
   */
  getProjectByID(id: number): Promise<ProjectResponseDTO | undefined>;
  /**
   * Delete single project by id
   */
  deleteProjectByID(id: number, currentUserId: User): Promise<void>;
}

/**
 * A token used to inject a concrete user service.
 */
export const ProjectServiceToken = new Token<IProjectService>();

/**
 * A service to handle users.
 */
@Service(ProjectServiceToken)
export class ProjectService implements IProjectService {
  private _projects!: Repository<Project>;
  private _users!: Repository<User>;

  public constructor(
    @Inject(DatabaseServiceToken) private readonly _database: IDatabaseService,
  ) {}

  /**
   * Sets up the user service.
   */
  public async bootstrap(): Promise<void> {
    this._projects = this._database.getRepository(Project);
    this._users = this._database.getRepository(User);
  }

  /**
   * Gets all projects.
   */
  public async getAllProjects(): Promise<readonly Project[]> {
    return this._database.getRepository(Project).find();
  }

  /**
   * Updates a project.
   * @param project The project to update
   */
  public async updateProject(project: Project, user: User): Promise<Project> {
    // TODO
    await this.checkPermission(project, user);
    // TODO allow changing allowRating only if admin
  }

  /**
   * Creates a project.
   * @param project The project to create
   */
  public async createProject(project: Project): Promise<Project> {
    // TODO
  }

  /**
   * Gets a project by its id.
   * @param id The id of the project
   */
  public async getProjectByID(id: number): Promise<ProjectResponseDTO | undefined> {
    const project = await this._projects.findOneBy({ id });
    return project || undefined;
  }

  /**
   * Deletes a project by its id.
   * @param id The id of the project
   */
  public async deleteProjectByID(id: number, currentUserId: User): Promise<void> {
    const project = await this._projects.findOneBy({ id });

    this.checkPermission(project, user);

    await this._projects.delete(id);

    return Promise.resolve();
  }

  /**
   * Throw errors if the user is not allowed to modify/access the project.
   */
  private async checkPermission(project: Project, user: User): Promise<void> {
    const team = await this._teams.getTeamById(project.teamId)
    if (!team.users.inclues(user.id)) {
      // Tried to access a project belonging to a different team, forbidden
      // TODO test
      throw new NotFoundError()
    }
  }
}
