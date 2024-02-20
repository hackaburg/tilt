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
  getTeamByID(id: number): Promise<Team | undefined>;
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
    const placeholder_img = [
      "https://i.imgur.com/CWwOYnr.png",
      "https://i.imgur.com/ZpFOtqy.png",
      "https://i.imgur.com/p1pfzOq.png",
      "https://i.imgur.com/uyovY3o.png",
      "https://i.imgur.com/ZjbBQs5.png",
      "https://i.imgur.com/NrdADj3.png",
    ];

    try {
      if (team.teamImg === "") {
        team.teamImg = placeholder_img[1];
      }
      return this._teams.save(team);
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  /**
   * Gets a team by its id.
   * @param id The id of the team
   */
  public async getTeamByID(id: number): Promise<Team | undefined> {
    return this._teams.findOne(id);
  }
}
