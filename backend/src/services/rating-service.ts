import { ForbiddenError, NotFoundError } from "routing-controllers";
import { Inject, Service, Token } from "typedi";
import { Repository } from "typeorm";
import { IService } from ".";
import { DatabaseServiceToken, IDatabaseService } from "./database-service";
import { ISettingsService, SettingsServiceToken } from "./settings-service";
import { Rating } from "../entities/rating";
import {
  RatingDTO,
  ProjectDTO,
  ProjectRatingResultDTO,
  convertBetweenEntityAndDTO,
} from "../controllers/dto";
import { User } from "../entities/user";
import { Team } from "../entities/team";
import { Project } from "../entities/project";
import { Criterion } from "../entities/criterion";
import { UserRole } from "../entities/user-role";

/**
 * A service to handle rating entities.
 */
export interface IRatingService extends IService {
  /**
   * Get the ratings for a specific project, cast by a specific user.
   * Users may only read their own created ratings.
   */
  getUsersRatingsForProject(
    projectId: number,
    user: User,
  ): Promise<readonly Rating[]>;
  /**
   *  Upsert a rating
   */
  upsertRating(rating: Rating, user: User): Promise<Rating>;
  /**
   * Get rating by id
   */
  getRatingByID(id: number, user: User): Promise<RatingDTO | undefined>;
  /**
   * Delete single rating by id
   */
  deleteRatingByID(id: number, currentUser: User): Promise<void>;
  /**
   * Get all ratings for every project
   */
  getRatingResults(): Promise<readonly ProjectRatingResultDTO[]>;
}

/**
 * A token used to inject a concrete user service.
 */
export const RatingServiceToken = new Token<IRatingService>();

/**
 * A service to handle rating entities.
 */
@Service(RatingServiceToken)
export class RatingService implements IRatingService {
  private _ratings!: Repository<Rating>;
  private _projects!: Repository<Project>;
  private _teams!: Repository<Team>;

  public constructor(
    @Inject(DatabaseServiceToken) private readonly _database: IDatabaseService,
    @Inject(SettingsServiceToken) private readonly _settings: ISettingsService,
  ) {}

  /**
   * Sets up the rating service.
   */
  public async bootstrap(): Promise<void> {
    this._ratings = this._database.getRepository(Rating);
    this._projects = this._database.getRepository(Project);
    this._teams = this._database.getRepository(Team);
  }

  /**
   * Get the ratings for a specific project, cast by a specific user.
   * Users may only read their own created ratings.
   */
  public async getUsersRatingsForProject(
    projectId: number,
    user: User,
  ): Promise<readonly Rating[]> {
    // TODO test
    return this._database.getRepository(Rating).find({
      where: {
        project: {
          id: projectId,
        },
        user: {
          id: user.id,
        },
      },
    });
  }

  /**
   * Upsert a rating.
   * @param rating The rating to create
   */
  public async upsertRating(rating: Rating, user: User): Promise<Rating> {
    await this.checkPermission(rating, user);

    const existingRating = await this._ratings.findOneBy({
      user: {
        id: user.id,
      },
      project: {
        id: rating.project.id,
      },
      criterion: {
        id: rating.criterion.id,
      },
    });

    if (existingRating) {
      // Update
      return this._ratings.save({
        ...rating,
        id: existingRating.id,
      });
    }

    return this._ratings.save(rating);
  }

  /**
   * Gets a rating by its id.
   * @param id The id of the rating
   */
  public async getRatingByID(
    id: number,
    user: User,
  ): Promise<RatingDTO | undefined> {
    const rating = await this._ratings.findOneBy({ id });

    if (!rating) {
      throw new NotFoundError("Rating not found");
    }

    if (rating.user.id !== user.id && user.role !== UserRole.Root) {
      throw new ForbiddenError();
    }

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
   * Get the average ratings for each project
   */
  public async getRatingResults(): Promise<readonly ProjectRatingResultDTO[]> {
    const allProjects = await this._projects.find();
    const allRatings = await this._ratings.find();

    const result: ProjectRatingResultDTO[] = [];

    const idToCriterion: Record<number, Criterion> = {};

    for (const project of allProjects) {
      const averagesPerCriterion: { criterion: Criterion; average: number }[] =
        [];

      // Sum up
      const criterionIdToSum: Record<number, number> = {};
      const criterionIdToCount: Record<number, number> = {};
      for (const rating of allRatings) {
        idToCriterion[rating.criterion.id] = rating.criterion;

        if (rating.project.id !== project.id) {
          continue;
        }

        const criterionId = rating.criterion.id;
        if (criterionIdToSum[criterionId] === undefined) {
          criterionIdToSum[criterionId] = 0;
          criterionIdToCount[criterionId] = 0;
        }

        criterionIdToSum[criterionId] += rating.rating;
        criterionIdToCount[criterionId] += 1;
      }

      // Calculate average
      Object.keys(criterionIdToSum)
        .map(Number)
        .forEach((criterionId) => {
          const count = criterionIdToCount[criterionId];
          if (count === 0) {
            return;
          }

          const sum = criterionIdToSum[criterionId];
          const average = sum / count;
          const criterion = idToCriterion[criterionId];
          averagesPerCriterion.push({ criterion, average });
        });

      result.push({
        project: convertBetweenEntityAndDTO(project, ProjectDTO),
        averagesPerCriterion,
      });
    }

    return result;
  }

  /**
   * Check if the user is permitted to create/modify/delete this rating.
   */
  private async checkPermission(rating: Rating, user: User): Promise<void> {
    if (!user.admitted) {
      throw new ForbiddenError("Only admitted users may rate projects");
    }

    // TODO only users in a team are allowed to vote. Prevent them from
    //  leaving their team to vote for themselves. However, they could leave
    //  their team and create a new one. So they need to be in a team that has
    //  been created before the rating started. I don't track the timestamp yet...
    //  Prevent teams from changing once rating starts is the best bet. Use the
    //  existing switch and prevent changes, add some text to the settings page that
    //  this is the case to avoid confusion. Still, people could join a second team
    //  before voting starts, in order to vote for their own project. I don't think
    //  it is possible to avoid this situation. It needs to be prohibited via the
    //  rules and it needs a way to check if this happened, but the ratings are
    //  anonymous. HOORAY. Or we allow people to rate their own project after all.
    if (user.team == null) {
      throw new ForbiddenError("You need to be part of a team to vote");
    }

    const settings = await this._settings.getSettings();
    if (!settings.project.allowRatingProjects) {
      throw new ForbiddenError("Rating is not allowed due to settings");
    }

    const project = await this._projects.findOneBy({ id: rating.project.id });
    if (!project) {
      throw new NotFoundError("Project not found");
    }
    if (!project.allowRating) {
      throw new ForbiddenError("Rating this project is not allowed");
    }

    const team = await this._teams.findOne(
      {
        where: {
          id: project.team.id
        },
        relations: [ "users", "requests" ]
      },
    );
    if (!team) {
      throw new NotFoundError("Team not found");
    }
    if (team.userIds().includes(user.id)) {
      throw new ForbiddenError("You can't rate your own project");
    }

    if (rating.user.id !== user.id) {
      throw new ForbiddenError("You can't rate as a different user");
    }
  }
}
