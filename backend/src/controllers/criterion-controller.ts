import {
  Authorized,
  Delete,
  Get,
  JsonController,
  Param,
  Put,
  Post,
  Body,
} from "routing-controllers";
import { Inject } from "typedi";
import { UserRole } from "../entities/user-role";
import {
  CriterionServiceToken,
  ICriterionService,
} from "../services/criterion-service";
import {
  CriterionDTO,
  SuccessResponseDTO,
  convertBetweenEntityAndDTO,
} from "./dto";
import { Criterion } from "../entities/criterion";

@JsonController("/criteria")
export class CriterionController {
  public constructor(
    @Inject(CriterionServiceToken)
    private readonly _criterion: ICriterionService,
  ) {}

  /**
   * Get all criteria.
   */
  @Get("/")
  @Authorized(UserRole.User)
  public async getAllCriteria(): Promise<CriterionDTO[]> {
    const criteria = await this._criterion.getAllCriteria();
    return criteria.map((c) => convertBetweenEntityAndDTO(c, CriterionDTO));
  }

  /**
   * Create a criterion.
   */
  @Post("/")
  @Authorized(UserRole.Root)
  public async createCriterion(
    @Body() { data: criterionDTO }: { data: CriterionDTO },
  ): Promise<CriterionDTO> {
    const criterion = convertBetweenEntityAndDTO(criterionDTO, Criterion);
    const createdCriterion = await this._criterion.createCriterion(criterion);
    return convertBetweenEntityAndDTO(createdCriterion, CriterionDTO);
  }

  /**
   * Update criteria.
   */
  @Put("/:id")
  @Authorized(UserRole.Root)
  public async updateCriterion(
    @Param("id") criterionId: number,
    @Body() { data: criterionDTO }: { data: CriterionDTO },
  ): Promise<CriterionDTO> {
    const criterion = convertBetweenEntityAndDTO(
      { ...criterionDTO, id: criterionId },
      Criterion,
    );
    const updateCriterion = await this._criterion.updateCriterion(criterion);
    return convertBetweenEntityAndDTO(updateCriterion, CriterionDTO);
  }

  /**
   * Delete criteria.
   */
  @Delete("/:id")
  @Authorized(UserRole.Root)
  public async deleteCriterion(
    @Param("id") criterionId: number,
  ): Promise<SuccessResponseDTO> {
    await this._criterion.deleteCriterionByID(criterionId);
    const response = new SuccessResponseDTO();
    response.success = true;
    return response;
  }
}
