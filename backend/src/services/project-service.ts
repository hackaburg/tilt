import { NotFoundError } from "routing-controllers";
import { Inject, Service, Token } from "typedi";
import { Repository } from "typeorm";
import { IService } from ".";
import { DatabaseServiceToken, IDatabaseService } from "./database-service";
import { Project } from "../entities/project";
import { Settings } from "../entities/settings";
import { Team } from "../entities/team";
import { User } from "../entities/user";
import { UserRole } from "../entities/user-role";

/**
 * An interface describing user handling.
 */
export interface IProjectService extends IService {
  /**
   * Get all projects
   */
  getAllProjects(user: User): Promise<readonly Project[]>;
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
  getProjectByID(id: number): Promise<Project | undefined>;
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
  private _teams!: Repository<Team>;
  private _settings!: Repository<Settings>;

  public constructor(
    @Inject(DatabaseServiceToken) private readonly _database: IDatabaseService,
  ) {}

  /**
   * Sets up the project service.
   */
  public async bootstrap(): Promise<void> {
    this._projects = this._database.getRepository(Project);
    this._teams = this._database.getRepository(Team);
    this._settings = this._database.getRepository(Settings);
  }

  /**
   * Gets all projects that the user may see.
   */
  public async getAllProjects(user: User): Promise<readonly Project[]> {
    const teams = await this._teams.find();
    const teamIds = teams
      .filter((team) => team.userIds().includes(user.id))
      .map((team) => team.id);

    const [settings] = await this._settings.find();
    const allowRatingProjects = settings.application.allowRatingProjects;
    const isAdmin = user.role === UserRole.Root;

    const projects = await this._projects.find();
    return projects.filter((project) => {
      return (
        isAdmin ||
        (project.allowRating && allowRatingProjects) ||
        teamIds.includes(project.team.id)
      );
    });
  }

  /**
   * Updates a project.
   * @param project The project to update
   */
  public async updateProject(project: Project, user: User): Promise<Project> {
    const existing = await this._projects.findOneBy({ id: project.id });

    if (!existing) {
      throw new NotFoundError();
    }

    await this.checkPermission(existing, user);

    existing.title = project.title;
    existing.description = project.description;
    existing.image = project.image;

    // Only admins may change allowRating
    if (user.role === UserRole.Root) {
      existing.allowRating = project.allowRating;
    }

    return this._projects.save(existing);
  }

  /**
   * Creates a project.
   * @param project The project to create
   */
  public async createProject(project: Project): Promise<Project> {
    return this._projects.save(project);
  }

  /**
   * Gets a project by its id.
   * @param id The id of the project
   */
  public async getProjectByID(id: number): Promise<Project | undefined> {
    const project = await this._projects.findOneBy({ id });
    return project || undefined;
  }

  /**
   * Deletes a project by its id.
   * @param id The id of the project
   */
  public async deleteProjectByID(
    id: number,
    currentUserId: User,
  ): Promise<void> {
    const project = await this._projects.findOneBy({ id });

    if (!project) {
      throw new NotFoundError();
    }

    await this.checkPermission(project, currentUserId);

    await this._projects.delete(id);

    return Promise.resolve();
  }

  /**
   * Throw errors if the user is not allowed to modify/access the project.
   */
  private async checkPermission(project: Project, user: User): Promise<void> {
    if (user.role === UserRole.Root) {
      return;
    }

    const team = project.team;
    if (!team || !team.userIds().includes(user.id)) {
      // Tried to access a project belonging to a different team, forbidden
      throw new NotFoundError();
    }
  }
}
