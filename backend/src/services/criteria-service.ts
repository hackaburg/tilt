import { NotFoundError } from "routing-controllers";
import { Inject, Service, Token } from "typedi";
import { Repository } from "typeorm";
import { IService } from ".";
import { DatabaseServiceToken, IDatabaseService } from "./database-service";
import { CriteriaDTO, convertBetweenEntityAndDTO } from "../controllers/dto";
import { Criteria } from "../entities/criteria";

export interface ICriteriaService extends IService {
  /**
   * Get all criterias
   */
  getAllCriterias(): Promise<readonly Criteria[]>;
  /**
   * Create new criteria
   */
  createCriteria(criteria: Criteria): Promise<Criteria>;
  /**
   *  Update criteria
   */
  updateCriteria(criteria: Criteria): Promise<Criteria>;
  /**
   * Get criteria by id
   */
  getCriteriaByID(id: number): Promise<CriteriaDTO | undefined>;
  /**
   * Delete single criteria by id
   */
  deleteCriteriaByID(id: number): Promise<void>;
}

/**
 * A token used to inject a concrete criteria service.
 */
export const CriteriaServiceToken = new Token<ICriteriaService>();

/**
 * A service to handle criterias.
 */
@Service(CriteriaServiceToken)
export class CriteriaService implements ICriteriaService {
  private _criterias!: Repository<Criteria>;

  public constructor(
    @Inject(DatabaseServiceToken) private readonly _database: IDatabaseService,
  ) {}

  /**
   * Sets up the criteria service.
   */
  public async bootstrap(): Promise<void> {
    this._criterias = this._database.getRepository(Criteria);
  }

  /**
   * Gets all criterias.
   */
  public async getAllCriterias(): Promise<readonly Criteria[]> {
    return this._criterias.find();
  }

  /**
   * Creates a criteria.
   * @param criteria The criteria to create
   */
  public async createCriteria(criteria: Criteria): Promise<Criteria> {
    return this._criterias.save(criteria);
  }

  /**
   * Updates a criteria.
   * @param criteria The criteria to update
   */
  public async updateCriteria(criteria: Criteria): Promise<Criteria> {
    const existing = await this._criterias.findOneBy({ id: criteria.id });

    if (!existing) {
      throw new NotFoundError("Criteria not found");
    }

    return this._criterias.save(criteria);
  }

  /**
   * Gets a criteria by its id.
   * @param id The id of the criteria
   */
  public async getCriteriaByID(id: number): Promise<CriteriaDTO | undefined> {
    const criteria = await this._criterias.findOneBy({ id });
    return criteria ? convertBetweenEntityAndDTO(criteria, CriteriaDTO) : undefined;
  }

  /**
   * Deletes a criteria by its id.
   * @param id The id of the criteria
   */
  public async deleteCriteriaByID(id: number): Promise<void> {
    const criteria = await this._criterias.findOneBy({ id });

    if (!criteria) {
      throw new NotFoundError("Criteria not found");
    }

    await this._criterias.delete(id);
  }
}
