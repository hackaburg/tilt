import {
  Authorized,
  Delete,
  Get,
  JsonController,
  Param,
  Put,
  Post,
  Body
} from "routing-controllers";
import { Inject } from "typedi";
import { UserRole } from "../entities/user-role";
import { CriteriaServiceToken, ICriteriaService } from "../services/criteria-service";
import {
  CriteriaDTO,
  SuccessResponseDTO,
  convertBetweenEntityAndDTO
} from "./dto";
import { Criteria } from "../entities/criteria";

@JsonController("/criteria")
export class CriteriaController {
  public constructor(
    @Inject(CriteriaServiceToken) private readonly _criterias: ICriteriaService,
  ) {}

  /**
   * Get all criteria.
   */
  @Get("/")
  @Authorized(UserRole.User)
  public async getAllCriteria(): Promise<CriteriaDTO[]> {
    const criterias = await this._criterias.getAllCriterias();
    return criterias.map((c) => convertBetweenEntityAndDTO(c, CriteriaDTO));
  }

  /**
   * Create criteria.
   */
  @Post("/")
  @Authorized(UserRole.Root)
  public async createCriteria(
    @Body() { data: criteriaDTO }: { data: CriteriaDTO },
  ): Promise<CriteriaDTO> {
    const criteria = convertBetweenEntityAndDTO(criteriaDTO, Criteria);
    const createdCriteria = await this._criterias.createCriteria(criteria);
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
    const criteria = convertBetweenEntityAndDTO({ ...criteriaDTO, id: criteriaId }, Criteria);
    const updateCriteria = await this._criterias.updateCriteria(criteria);
    return convertBetweenEntityAndDTO(updateCriteria, CriteriaDTO);
  }

  /**
   * Delete criteria.
   */
  @Delete("/:id")
  @Authorized(UserRole.Root)
  public async deleteCriteria(
    @Param("id") criteriaId: number,
  ): Promise<SuccessResponseDTO> {
    await this._criterias.deleteCriteriaByID(criteriaId);
    const response = new SuccessResponseDTO();
    response.success = true;
    return response;
  }
}
