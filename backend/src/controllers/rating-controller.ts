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
   * Allow users to rate a specific project (if ratings are enabled in the application
   * settings).
   *
   * By using the application setting, admins can prepare the projects that can be
   * rated, and then allow all of them at the same time. And when the rating is closed,
   * disable all of them at the same time. This is done in the settings-controller.
   *
   * TODO probably move to the project controller, allow changing this setting only
   *  if an admin
   *
   * TODO write test that the attribute cannot be changed by the project put endpoint
   *  by regular users
   */
  @Post("/make-project-ratable")
  @Authorized(UserRole.Root)
  public async enableRatingForProject(): Promise<void> {
    // TODO set allowRating of project
  }

  /**
   * Rate a project
   *
   * TODO mvp: no update and delete, a created rating is a commitment to it.
   *  If there is time, add an update mechanism though.
   */
  @Post("/rate")
  @Authorized(UserRole.User)
  public async createRating(
    @Body() { data: ratingDTO }: { data: RatingDTO },
    @CurrentUser() user: User,
  ): Promise<RatingDTO> {
    const rating = convertBetweenEntityAndDTO(ratingDTO, Rating);
    const createdRating = await this._ratings.createRating(rating);
    return convertBetweenEntityAndDTO(createdRating, RatingDTO);
  }

  // TODO write test that all the root endpoints are not accessible by users
}
