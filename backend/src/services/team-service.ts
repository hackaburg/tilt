import { Inject, Service, Token } from "typedi";
import { Repository } from "typeorm";
import { IService } from ".";
import { DatabaseServiceToken, IDatabaseService } from "./database-service";
import { Team } from "../entities/team";
import {
  TeamResponseDTO,
  convertBetweenEntityAndDTO,
} from "../controllers/dto";
import { User } from "../entities/user";

/**
 * An interface describing user handling.
 */
export interface ITeamService extends IService {
  getAllTeams(): Promise<readonly Team[]>;
  createTeam(team: Team): Promise<Team>;
  updateTeam(team: Team): Promise<Team>;
  getTeamByID(
    id: number,
    currentUserId: number,
  ): Promise<TeamResponseDTO | undefined>;
  acceptUserToTeam(
    teamId: number,
    userId: number,
    currentUserId: User,
  ): Promise<void>;
  deleteTeamByID(id: number, currentUserId: User): Promise<void>;
  requestToJoinTeam(teamId: number, user: User): Promise<void>;
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
  private _users!: Repository<User>;

  public constructor(
    @Inject(DatabaseServiceToken) private readonly _database: IDatabaseService,
  ) {}

  /**
   * Sets up the user service.
   */
  public async bootstrap(): Promise<void> {
    this._teams = this._database.getRepository(Team);
    this._users = this._database.getRepository(User);
  }

  /**
   * Gets all teams.
   */
  public async getAllTeams(): Promise<readonly Team[]> {
    return this._database.getRepository(Team).find();
  }

  /**
   * Updates a team.
   * @param team The team to update
   */
  public async updateTeam(team: Team): Promise<Team> {
    return this._teams.save(team);
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
        team.teamImg =
          placeholder_img[Math.floor(Math.random() * placeholder_img.length)];
      }
      team.requests = [];
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
  public async getTeamByID(
    id: number,
    currentUserId: number,
  ): Promise<TeamResponseDTO | undefined> {
    let team = await this._teams.findOne(id);

    if (team == null) {
      return undefined;
    } else {
      const teamResponse = convertBetweenEntityAndDTO(team, TeamResponseDTO);
      let users = await this._users.findByIds(team?.users!);
      teamResponse.users = users.map((user) => {
        return {
          id: user.id,
          name: `${user.firstName} ${user.lastName[0]}. #${user.id}`,
        };
      });

      if (currentUserId === teamResponse.users[0].id) {
        let userRequests = await this._users.findByIds(team?.requests!);
        teamResponse.requests = userRequests.map((user) => {
          return {
            id: user.id,
            name: `${user.firstName} ${user.lastName[0]}. #${user.id}`,
          };
        });
      } else {
        teamResponse.requests = [];
      }

      return teamResponse;
    }
  }

  /**
   * Requests to join a team.
   * @param teamId The id of the team
   * @param user The user requesting to join
   */
  public async requestToJoinTeam(teamId: number, user: User): Promise<void> {
    const team = await this._teams.findOne(teamId);

    if (team == null) {
      throw new Error(`no team with id ${teamId}`);
    }

    //convert team.requests to string array
    const requests = team.requests.map((id) => id.toString());

    if (requests.indexOf(user.id.toString()) > -1) {
      throw new Error(
        `user ${user.id} already requested to join team ${teamId}`,
      );
    }

    team.requests.push(user.id);
    await this._teams.save(team);
    return Promise.resolve();
  }

  /**
   * Deletes a team by its id.
   * @param id The id of the team
   */
  public async deleteTeamByID(id: number, currentUserId: User): Promise<void> {
    const team = await this._teams.findOne(id);

    //check if user is the owner of the team
    if (team?.users[0].toString() !== currentUserId.id.toString()) {
      throw new Error("You are not the owner of this team");
    }

    await this._teams.delete(id);

    return Promise.resolve();
  }

  /**
   * Accepts a user to a team.
   * @param teamId The id of the team
   * @param userId The id of the user
   * @param user The user accepting the request
   */
  public async acceptUserToTeam(
    teamId: number,
    userId: number,
    user: User,
  ): Promise<void> {
    const team = await this._teams.findOne(teamId);

    if (team == null) {
      throw new Error(`no team with id ${teamId}`);
    }

    //check if user is the owner of the team
    if (team?.users[0].toString() !== user.id.toString()) {
      throw new Error("You are not the owner of this team");
    }

    //convert team.requests to string array
    const requests = team.requests.map((id) => id.toString());

    if (requests.indexOf(userId.toString()) === -1) {
      throw new Error(`user ${userId} did not request to join team ${teamId}`);
    }

    team.requests = team.requests.filter(
      (id) => id.toString() !== userId.toString(),
    );
    team.users.push(userId);
    await this._teams.save(team);
    return Promise.resolve();
  }
}
