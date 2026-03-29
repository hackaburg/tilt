import { BadRequestError, ForbiddenError, NotFoundError } from "routing-controllers";
import { Inject, Service, Token } from "typedi";
import { Repository } from "typeorm";
import { IService } from ".";
import { DatabaseServiceToken, IDatabaseService } from "./database-service";
import { ISettingsService, SettingsServiceToken } from "./settings-service";
import { Rating } from "../entities/rating";
import { RatingDTO, convertBetweenEntityAndDTO } from "../controllers/dto";
import { User } from "../entities/user";
import { Team } from "../entities/team";
import { Project } from "../entities/project";
import { Criteria } from "../entities/criteria";

export interface CriteriaRatingResult {
  criteria: Criteria;
  averageRating: number;
  voteCount: number;
}

export interface ProjectRatingResult {
  project: Project;
  criteriaResults: readonly CriteriaRatingResult[];
  overallScore: number;
}

export interface IRatingService extends IService {
  /**
   * Get all ratings
   */
  getAllRatings(): Promise<readonly Rating[]>;
  /**
   * Create new rating
   */
  createRating(rating: Rating, user: User): Promise<Rating>;
  /**
   *  Update rating
   */
  updateRating(rating: Rating, user: User): Promise<Rating>;
  /**
   * Get rating by id
   */
  getRatingByID(id: number): Promise<RatingDTO | undefined>;
  /**
   * Delete single rating by id
   */
  deleteRatingByID(id: number, currentUser: User): Promise<void>;
  /**
   * Get aggregated rating results grouped by project and criteria
   */
  getRatingResults(): Promise<readonly ProjectRatingResult[]>;
}

/**
 * A token used to inject a concrete user service.
 */
export const RatingServiceToken = new Token<IRatingService>();

/**
 * A service to handle users.
 */
@Service(RatingServiceToken)
export class RatingService implements IRatingService {
  private _ratings!: Repository<Rating>;
  private _projects!: Repository<Project>;
  private _teams!: Repository<Team>;
  private _users!: Repository<User>;

  public constructor(
    @Inject(DatabaseServiceToken) private readonly _database: IDatabaseService,
                     @Inject(SettingsServiceToken) private readonly _settings: ISettingsService,
  ) {}

  /**
   * Sets up the user service.
   */
  public async bootstrap(): Promise<void> {
    this._ratings = this._database.getRepository(Rating);
    this._projects = this._database.getRepository(Project);
    this._teams = this._database.getRepository(Team);
    this._users = this._database.getRepository(User);
  }

  /**
   * Gets all ratings.
   */
  public async getAllRatings(): Promise<readonly Rating[]> {
    return this._database.getRepository(Rating).find();
  }

  /**
   * Updates a rating.
   * @param rating The rating to update
   */
  public async updateRating(rating: Rating, user: User): Promise<Rating> {
    const originRating = await this._ratings.findOneBy({ id: rating.id });

    if (!originRating) {
      throw new NotFoundError("Rating not found");
    }

    if (user.id !== originRating.user.id) {
      throw new ForbiddenError("You can only update your own ratings");
    }

    await this.checkPermission(rating, user);

    return this._ratings.save(rating);
  }

  /**
   * Creates a rating.
   * @param rating The rating to create
   */
  public async createRating(rating: Rating, user: User): Promise<Rating> {
    await this.checkPermission(rating, user);

    const existing = await this._ratings.findOne({
      where: {
        user: { id: user.id },
        project: { id: rating.project.id },
        critera: { id: rating.critera.id },
      },
    });

    if (existing) {
      throw new BadRequestError("You have already rated this project for this criteria");
    }

    return this._ratings.save(rating);
  }

  /**
   * Gets a rating by its id.
   * @param id The id of the rating
   */
  public async getRatingByID(id: number): Promise<RatingDTO | undefined> {
    const rating = await this._ratings.findOneBy({ id });
    return rating ? convertBetweenEntityAndDTO(rating, RatingDTO) : undefined;
  }

  /**
   * Deletes a rating by its id.
   * @param id The id of the rating
   */
  public async deleteRatingByID(id: number, currentUser: User): Promise<void> {
    const rating = await this._ratings.findOneBy({ id });

    if (!rating) {
      throw new NotFoundError("Rating not found");
    }

    if (currentUser.id !== rating.user.id) {
      throw new ForbiddenError("You can only delete your own ratings");
    }

    await this.checkPermission(rating, currentUser);

    await this._ratings.delete(id);

    return Promise.resolve();
  }

  /**
   * Gets aggregated rating results grouped by project and criteria.
   */
  public async getRatingResults(): Promise<readonly ProjectRatingResult[]> {
    const allRatings = await this._ratings.find();

    const byProject = new Map<number, Rating[]>();
    for (const rating of allRatings) {
      const projectId = rating.project.id;
      if (!byProject.has(projectId)) {
        byProject.set(projectId, []);
      }
      byProject.get(projectId)!.push(rating);
    }

    const results: ProjectRatingResult[] = [];
    for (const [, projectRatings] of byProject) {
      const project = projectRatings[0].project;

      const byCriteria = new Map<number, Rating[]>();
      for (const rating of projectRatings) {
        const criteriaId = rating.critera.id;
        if (!byCriteria.has(criteriaId)) {
          byCriteria.set(criteriaId, []);
        }
        byCriteria.get(criteriaId)!.push(rating);
      }

      const criteriaResults: CriteriaRatingResult[] = [];
      let totalScore = 0;
      for (const [, criteriaRatings] of byCriteria) {
        const criteria = criteriaRatings[0].critera;
        const averageRating =
          criteriaRatings.reduce((sum, r) => sum + r.rating, 0) / criteriaRatings.length;
        totalScore += averageRating;
        criteriaResults.push({
          criteria,
          averageRating,
          voteCount: criteriaRatings.length,
        });
      }

      results.push({
        project,
        criteriaResults,
        overallScore: criteriaResults.length > 0 ? totalScore / criteriaResults.length : 0,
      });
    }

    return results;
  }

  private async checkPermission(rating: Rating, user: User): Promise<void> {
    const settings = await this._settings.getSettings();
    if (!settings.allowRating) {
      throw new ForbiddenError("Rating is not allowed due to application settings")
    }

    const project = await this._projects.findOneBy({ id: rating.project.id });
    if (!project) {
      throw new NotFoundError("Project not found");
    }
    if (!project.allowRating) {
      throw new ForbiddenError("Rating this project is not allowed")
    }

    const team = await this._teams.findOneBy({ id: project.team.id })
    if (!team) {
      throw new NotFoundError("Team not found");
    }
    if (team.users.includes(user.id)) {
      throw new ForbiddenError("You can't rate your own project")
    }
  }
}
