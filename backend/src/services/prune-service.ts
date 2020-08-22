import { Inject, Service, Token } from "typedi";
import { Repository } from "typeorm";
import { IService } from ".";
import { Answer } from "../entities/answer";
import { User } from "../entities/user";
import { DatabaseServiceToken, IDatabaseService } from "./database-service";

/**
 * A service to prune system data.
 */
export interface IPruneService extends IService {
  /**
   * Prunes user data but keeps all settings.
   */
  prune(): Promise<void>;
}

/**
 * A token used to inject a concrete prune service.
 */
export const PruneServiceToken = new Token<IPruneService>();

@Service(PruneServiceToken)
export class PruneService implements IPruneService {
  private _users!: Repository<User>;
  private _answers!: Repository<Answer>;

  public constructor(
    @Inject(DatabaseServiceToken) private readonly _database: IDatabaseService,
  ) {}

  /**
   * @inheritdoc
   */
  public async bootstrap(): Promise<void> {
    this._users = this._database.getRepository(User);
    this._answers = this._database.getRepository(Answer);
  }

  /**
   * @inheritdoc
   */
  public async prune(): Promise<void> {
    await this._answers.delete({});
    await this._users.delete({});
  }
}
