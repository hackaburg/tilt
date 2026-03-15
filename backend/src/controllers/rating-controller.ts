import { Authorized, Delete, JsonController, ForbiddenError } from "routing-controllers";
import { Inject } from "typedi";
import { UserRole } from "../entities/user-role";
import { SettingsServiceToken } from "../services/settings-service";
import { SettingsServiceToken } from "../services/settings-service";

// The RatingController and RatingService group stuff concerning ratings and critiera
// together. Feel free to separate, if you think that would be better.

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
    @Body() { data: RatingDTO }: { data: RatingDTO },
    @CurrentUser() user: User,
  ): Promise<readonly RatingDTO[]> {
    const rating = convertBetweenEntityAndDTO(RatingDTO, Rating);
    const createdRating = await this._ratings.createRating(rating);
    return convertBetweenEntityAndDTO(createdRating, RatingDTO);
  }

  /**
   * Create criteria.
   */
  @Post("/criteria")
  @Authorized(UserRole.Root)
  public async createCriteria(
    @Body() { data: criteriaDTO }: { data: CriteriaDTO },
  ): Promise<readonly CriteriaDTO[]> {
    const criteria = convertBetweenEntityAndDTO(criteriaDTO, Criteria);
    const createdCriteria = await this._ratings.createCriteria();
    return convertBetweenEntityAndDTO(createdCriteria, CriteriaDTO);
  }

  /**
   * Update criteria.
   */
  @Put("/criteria/:id")
  @Authorized(UserRole.Root)
  public async updateCriteria(
    @Param("id") teamId: number,
    @Body() { data: criteriaDTO }: { data: CriteriaDTO },
  ): Promise<TeamDTO> {
    // TODO There is a TeamUpdateDTO. CriteriaUpdateDTO?
    const team = convertBetweenEntityAndDTO(criteriaDTO, Criteria);
    const updateTeam = await this._ratings.updateCriteria(team, user);
    return convertBetweenEntityAndDTO(updateCriteria, CriteriaDTO);
  }

  /**
   * Delete criteria.
   */
  @Delete("/criteria/:id")
  @Authorized(UserRole.Root)
  public async deleteCriteria(
    @Param("id") criteriaId: number,
    @CurrentUser() user: User,
  ): Promise<SuccessResponseDTO> {
    await this._ratings.deleteCriteriaByID(criteriaId, user);
    const response = new SuccessResponseDTO();
    response.success = true;
    return response;
  }

  // TODO write test that all the root endpoints are not accessible by users
}
