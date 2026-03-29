import {
  Authorized,
  Delete,
  JsonController,
  CurrentUser,
  Param,
  Put,
  Post,
  Body
} from "routing-controllers";
import { Inject } from "typedi";
import { UserRole } from "../entities/user-role";
import { RatingServiceToken, IRatingService } from "../services/rating-service";
import {
  CriteriaDTO,
  SuccessResponseDTO,
  convertBetweenEntityAndDTO
} from "./dto";
import { User } from "../entities/user";
import { Criteria } from "../entities/criteria";

@JsonController("/criteria")
export class CriteriaController {
  public constructor(
    @Inject(RatingServiceToken) private readonly _ratings: IRatingService,
  ) {}

  /**
   * Create criteria.
   */
  @Post("/")
  @Authorized(UserRole.Root)
  public async createCriteria(
    @Body() { data: criteriaDTO }: { data: CriteriaDTO },
  ): Promise<CriteriaDTO> {
    const criteria = convertBetweenEntityAndDTO(criteriaDTO, Criteria);
    const createdCriteria = await this._ratings.createCriteria(criteria);
    return convertBetweenEntityAndDTO(createdCriteria, CriteriaDTO);
  }

  /**
   * Update criteria.
   */
  @Put("/:id")
  @Authorized(UserRole.Root)
  public async updateCriteria(
    @Param("id") criteriaId: number,
    @Body() { data: criteriaDTO }: { data: CriteriaDTO },
  ): Promise<CriteriaDTO> {
    const criteria = convertBetweenEntityAndDTO(criteriaDTO, Criteria);
    const updateCriteria = await this._ratings.updateCriteria(criteria);
    return convertBetweenEntityAndDTO(updateCriteria, CriteriaDTO);
  }

  /**
   * Delete criteria.
   */
  @Delete("/:id")
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
}
