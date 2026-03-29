import { ForbiddenError } from "routing-controllers";
import { Inject, Service, Token } from "typedi";
import { Repository } from "typeorm";
import { IService } from ".";
import { DatabaseServiceToken, IDatabaseService } from "./database-service";
import { Rating } from "../entities/rating";
import {
  RatingResponseDTO,
  convertBetweenEntityAndDTO,
} from "../controllers/dto";
import { User } from "../entities/user";
import { Team } from "../entities/team";
import { Project } from "../entities/project";
import { Criteria } from "../entities/criteria";
import { Rating } from "../entities/rating";

export interface IRatingService extends IService {
  /**
   * Get all ratings
   */
  getAllRatings(): Promise<readonly Rating[]>;
  /**
   * Create new rating
   */
  createRating(rating: Rating): Promise<Rating>;
  /**
   *  Update rating
   */
  updateRating(rating: Rating): Promise<Rating>;
  /**
   * Get rating by id
   */
  getRatingByID(id: number): Promise<RatingResponseDTO | undefined>;
  /**
   * Delete single rating by id
   */
  deleteRatingByID(id: number, currentUserId: User): Promise<void>;
  //
  //
  /**
   * Get all criterias
   */
  getAllCriterias(): Promise<readonly Criteria[]>;
  /**
   * Create new criteria
   */
  createCriteria(criteria: Criteria): Promise<Criteria>;
  /**
   *  Update criteria
   */
  updateCriteria(criteria: Criteria): Promise<Criteria>;
  /**
   * Get criteria by id
   */
  getCriteriaByID(id: number): Promise<CriteriaResponseDTO | undefined>;
  /**
   * Delete single criteria by id
   */
  deleteCriteriaByID(id: number, currentUserId: User): Promise<void>;
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
  ) {}

  /**
   * Sets up the user service.
   */
  public async bootstrap(): Promise<void> {
    this._ratings = this._database.getRepository(Rating);
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
    // TODO validate, throw Errors

    const originRating = await this._ratings.findOneBy({ id: rating.id });

    // TODO only if user matches
    await this.checkPermission(rating, user);
    const originRatingUser = originRating.users;
    if (user.id != originRatingUser.id) {
      throw new Error("")
    }

    return this._ratings.save(rating);
  }

  /**
   * Creates a rating.
   * @param rating The rating to create
   */
  public async createRating(rating: Rating): Promise<Rating> {
    // TODO validate
    this.checkPermission(rating, user);
    return this._ratings.save(rating);
  }

  /**
   * Gets a rating by its id.
   * @param id The id of the rating
   */
  public async getRatingByID(id: number): Promise<RatingResponseDTO | undefined> {
    const rating = await this._ratings.findOneBy({ id });
    return rating || undefined;
  }

  /**
   * Deletes a rating by its id.
   * @param id The id of the rating
   */
  public async deleteRatingByID(id: number, currentUserId: User): Promise<void> {
    const rating = await this._ratings.findOneBy({ id });

    await this.checkPermission(rating, user);

    await this._ratings.delete(id);

    return Promise.resolve();
  }

  private async checkPermission(rating: Rating, user: User): Promise<void> {
    // TODO use this._database.blabla instead of _settings and such

    const settings = await this._settings.getSettings();
    if (!settings.allowRating) {
      // TODO test
      throw new ForbiddenError("Cannot create rating due to application settings")
    }

    const project = await await this._projects.findOneBy({ id: data.id });
    if (!project.allowRating) {
      // TODO test
      throw new ForbiddenError("Creating a rating for this project is not allowed")
    }

    const team = await this._teams.findOneById(project.teamId)
    if (team.users.inclues(user.id)) {
      // TODO test
      throw new ForbiddenError("You can't rate your own project")
    }
  }
}
