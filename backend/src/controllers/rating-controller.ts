import {
  Authorized,
  JsonController,
  CurrentUser,
  Get,
  Post,
  Body
} from "routing-controllers";
import { Inject } from "typedi";
import { UserRole } from "../entities/user-role";
import { SettingsServiceToken, ISettingsService } from "../services/settings-service";
import { RatingServiceToken, IRatingService } from "../services/rating-service";
import {
  RatingDTO,
  ProjectRatingResultDTO,
  convertBetweenEntityAndDTO
} from "./dto";
import { User } from "../entities/user";
import { Rating } from "../entities/rating";

@JsonController("/ratings")
export class RatingController {
  public constructor(
    @Inject(SettingsServiceToken) private readonly _settings: ISettingsService,
    @Inject(RatingServiceToken) private readonly _ratings: IRatingService,
  ) {}

  /**
   * Get all ratings.
   */
  @Get("/")
  @Authorized(UserRole.Root)
  public async getAllRatings(): Promise<RatingDTO[]> {
    const ratings = await this._ratings.getAllRatings();
    return ratings.map((r) => convertBetweenEntityAndDTO(r, RatingDTO));
  }

  /**
   * Get aggregated rating results grouped by project and criteria.
   */
  @Get("/results")
  @Authorized(UserRole.Root)
  public async getRatingResults(): Promise<ProjectRatingResultDTO[]> {
    const results = await this._ratings.getRatingResults();
    return results.map((r) => convertBetweenEntityAndDTO(r, ProjectRatingResultDTO));
  }

  /**
   * Rate a project
   */
  @Post("/rate")
  @Authorized(UserRole.User)
  public async createRating(
    @Body() { data: ratingDTO }: { data: RatingDTO },
    @CurrentUser() user: User,
  ): Promise<RatingDTO> {
    const rating = convertBetweenEntityAndDTO(ratingDTO, Rating);
    const createdRating = await this._ratings.createRating(rating, user);
    return convertBetweenEntityAndDTO(createdRating, RatingDTO);
  }
}
