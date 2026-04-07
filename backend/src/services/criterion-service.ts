import { NotFoundError } from "routing-controllers";
import { Inject, Service, Token } from "typedi";
import { Repository } from "typeorm";
import { IService } from ".";
import { DatabaseServiceToken, IDatabaseService } from "./database-service";
import { CriterionDTO, convertBetweenEntityAndDTO } from "../controllers/dto";
import { Criterion } from "../entities/criterion";

export interface ICriterionService extends IService {
  /**
   * Get all criteria
   */
  getAllCriteria(): Promise<readonly Criterion[]>;
  /**
   * Create new criteria
   */
  createCriterion(criterion: Criterion): Promise<Criterion>;
  /**
   *  Update criteria
   */
  updateCriterion(criterion: Criterion): Promise<Criterion>;
  /**
   * Get criteria by id
   */
  getCriterionByID(id: number): Promise<CriterionDTO | undefined>;
  /**
   * Delete single criteria by id
   */
  deleteCriterionByID(id: number): Promise<void>;
}

/**
 * A token used to inject a concrete criteria service.
 */
export const CriterionServiceToken = new Token<ICriterionService>();

/**
 * A service to handle criteria.
 */
@Service(CriterionServiceToken)
export class CriterionService implements ICriterionService {
  private _criteria!: Repository<Criterion>;

  public constructor(
    @Inject(DatabaseServiceToken) private readonly _database: IDatabaseService,
  ) {}

  /**
   * Sets up the criteria service.
   */
  public async bootstrap(): Promise<void> {
    this._criteria = this._database.getRepository(Criterion);
  }

  /**
   * Gets all criteria.
   */
  public async getAllCriteria(): Promise<readonly Criterion[]> {
    return this._criteria.find();
  }

  /**
   * Creates a criteria.
   * @param criteria The criteria to create
   */
  public async createCriterion(criterion: Criterion): Promise<Criterion> {
    return this._criteria.save(criterion);
  }

  /**
   * Updates a criteria.
   * @param criteria The criteria to update
   */
  public async updateCriterion(criterion: Criterion): Promise<Criterion> {
    const existing = await this._criteria.findOneBy({ id: criterion.id });

    if (!existing) {
      throw new NotFoundError("Criterion not found");
    }

    return this._criteria.save(criterion);
  }

  /**
   * Gets a criteria by its id.
   * @param id The id of the criteria
   */
  public async getCriterionByID(id: number): Promise<CriterionDTO | undefined> {
    const criteria = await this._criteria.findOneBy({ id });
    return criteria
      ? convertBetweenEntityAndDTO(criteria, CriterionDTO)
      : undefined;
  }

  /**
   * Deletes a criteria by its id.
   * @param id The id of the criteria
   */
  public async deleteCriterionByID(id: number): Promise<void> {
    const criteria = await this._criteria.findOneBy({ id });

    if (!criteria) {
      throw new NotFoundError("Criterion not found");
    }

    await this._criteria.delete(id);
  }
}
