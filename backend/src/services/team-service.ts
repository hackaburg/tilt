import { Inject, Service, Token } from "typedi";
import { Repository } from "typeorm";
import { IService } from ".";
import { DatabaseServiceToken, IDatabaseService } from "./database-service";
import { Team } from "../entities/team";

/**
 * An interface describing user handling.
 */
export interface ITeamService extends IService {
  getAllTeams(): Promise<readonly Team[]>;
  createTeam(team: Team): Promise<Team>;
}

/**
 * A token used to inject a concrete user service.
 */
export const TeamServiceToken = new Token<ITeamService>();

/**
 * A service to handle users.
 */
@Service(TeamServiceToken)
export class TeamService implements ITeamService {
  private _teams!: Repository<Team>;

  public constructor(
    @Inject(DatabaseServiceToken) private readonly _database: IDatabaseService,
  ) {}

  /**
   * Sets up the user service.
   */
  public async bootstrap(): Promise<void> {
    this._teams = this._database.getRepository(Team);
    console.log("Team service bootstrapped", this._teams);
  }

  /**
   * Gets all teams.
   */
  public async getAllTeams(): Promise<readonly Team[]> {
    return this._database.getRepository(Team).find();
  }

  /**
   * Creates a team.
   * @param team The team to create
   */
  public async createTeam(team: Team): Promise<Team> {
    try {
      return this._teams.save(team);
    } catch (e) {
      console.error(e);
      throw e;
    }
  }
}
