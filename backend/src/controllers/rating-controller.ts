import {
  Authorized,
  JsonController,
  CurrentUser,
  Post,
  Body
} from "routing-controllers";
import { Inject } from "typedi";
import { UserRole } from "../entities/user-role";
import { SettingsServiceToken, ISettingsService } from "../services/settings-service";
import { RatingServiceToken, IRatingService } from "../services/rating-service";
import {
  RatingDTO,
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
   * Rate a project
   *
   * TODO mvp: no update and delete, a created rating is a commitment to it.
   *  If there is time, add an update mechanism though.
   */
  @Post("/rate")
  @Authorized(UserRole.Root)
  public async createRating(
    @Body() { data: ratingDTO }: { data: RatingDTO },
    @CurrentUser() user: User,
  ): Promise<RatingDTO> {
    const rating = convertBetweenEntityAndDTO(ratingDTO, Rating);
    const createdRating = await this._ratings.createRating(rating, user);
    return convertBetweenEntityAndDTO(createdRating, RatingDTO);
  }

  // TODO write test that all the root endpoints are not accessible by users
}
