import {
  Authorized,
  JsonController,
  CurrentUser,
  Get,
  Post,
  Body,
  Param,
} from "routing-controllers";
import { Inject } from "typedi";
import { UserRole } from "../entities/user-role";
import { RatingServiceToken, IRatingService } from "../services/rating-service";
import {
  RatingDTO,
  ProjectRatingResultDTO,
  convertBetweenEntityAndDTO,
} from "./dto";
import { User } from "../entities/user";
import { Rating } from "../entities/rating";

@JsonController("/ratings")
export class RatingController {
  public constructor(
    @Inject(RatingServiceToken) private readonly _ratings: IRatingService,
  ) {}

  /**
   * Get aggregated rating results grouped by project and criteria.
   */
  @Get("/by-project/:id")
  @Authorized(UserRole.User)
  public async getUsersRatingsForProject(
    @Param("id") projectId: number,
    @CurrentUser() user: User,
  ): Promise<RatingDTO[]> {
    const results = await this._ratings.getUsersRatingsForProject(
      projectId,
      user,
    );
    return results.map((r) => convertBetweenEntityAndDTO(r, RatingDTO));
  }

  /**
   * Get aggregated rating results grouped by project and criteria.
   */
  @Get("/results")
  @Authorized(UserRole.Root)
  public async getRatingResults(): Promise<ProjectRatingResultDTO[]> {
    const results = await this._ratings.getRatingResults();
    return results.map((r) =>
      convertBetweenEntityAndDTO(r, ProjectRatingResultDTO),
    );
  }

  /**
   * Rate a project
   */
  @Post("/rate")
  @Authorized(UserRole.User)
  public async rate(
    @Body() { data: ratingDTO }: { data: RatingDTO },
    @CurrentUser() user: User,
  ): Promise<RatingDTO> {
    const rating = convertBetweenEntityAndDTO(ratingDTO, Rating);

    // Ensure ratings cannot be cast for other users,
    // write the requesting user into it.
    rating.user = user;

    const createdRating = await this._ratings.upsertRating(rating, user);
    return convertBetweenEntityAndDTO(createdRating, RatingDTO);
  }
}
