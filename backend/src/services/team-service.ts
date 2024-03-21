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
  /**
   * Get all teams
   */
  getAllTeams(): Promise<readonly Team[]>;
  /**
   * Create new team
   */
  createTeam(team: Team): Promise<Team>;
  /**
   *  Update team
   */
  updateTeam(team: Team, user: User): Promise<Team>;
  /**
   * Get team by id
   */
  getTeamByID(id: number): Promise<TeamResponseDTO | undefined>;
  /**
   * Accept user request to join team
   */
  acceptUserToTeam(
    teamId: number,
    userId: number,
    currentUserId: User,
  ): Promise<void>;
  /**
   * Delete single team by id
   */
  deleteTeamByID(id: number, currentUserId: User): Promise<void>;
  /**
   * Request to join a team
   */
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
  public async updateTeam(team: Team, user: User): Promise<Team> {
    if (team.title === "") {
      throw new Error("Team title cannot be empty");
    }

    if (team.description === "") {
      throw new Error("Team description cannot be empty");
    }

    if (team.users.length === 0) {
      throw new Error("Please add at least one user to the team");
    }

    const originTeam = await this._teams.findOne(team.id);
    const originTeamUsers = originTeam?.users.map((id) => id.toString());

    if (!originTeamUsers!.includes(user.id.toString())) {
      throw new Error("You are not a member of this team");
    }

    if (originTeam?.users.join() !== team.users.join()) {
      if (originTeam!.users[0].toString() !== user.id.toString()) {
        throw new Error("You are not the owner of this team");
      }
      return this._teams.save(team);
    }

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
      "https://i.imgur.com/qRSgY3B.png",
      "https://i.imgur.com/oCBHuP6.png",
      "https://i.imgur.com/lZ2CX4I.png",
      "https://i.imgur.com/kJDnZfj.png",
      "https://i.imgur.com/wTWrswV.png",
      "https://i.imgur.com/seFyjfb.png",
    ];

    if (team.title === "") {
      throw new Error("Team title cannot be empty");
    }

    if (team.description === "") {
      throw new Error("Team description cannot be empty");
    }

    if (team.users.length === 0) {
      throw new Error("Please add at least one user to the team");
    }

    if (team.users.length > 8) {
      throw new Error("A team can have a maximum of 5 users");
    }

    const user = team.users[0];
    const allTeams = await this._database.getRepository(Team).find();
    const userTeams = allTeams.filter(
      (t) => t.users[0].toString() === user.toString(),
    );

    if (userTeams.length >= 5) {
      throw new Error(
        "You already have created 5 teams. Please delete one first.",
      );
    }

    try {
      if (team.teamImg === "") {
        team.teamImg =
          placeholder_img[Math.floor(Math.random() * placeholder_img.length)];
      }
      team.requests = [];
      return this._teams.save(team);
    } catch (e) {
      throw e;
    }
  }
  /**
   * Gets a team by its id.
   * @param id The id of the team
   */
  public async getTeamByID(id: number): Promise<TeamResponseDTO | undefined> {
    const team = await this._teams.findOne(id);

    if (team == null) {
      return undefined;
    } else {
      const teamResponse = convertBetweenEntityAndDTO(team, TeamResponseDTO);
      const users = await this._users.findByIds(team?.users!);
      const mappedUsers: any = [];

      teamResponse.users!.forEach((userId) => {
        users.map((user) => {
          if (user.id.toString() === userId.toString()) {
            mappedUsers.push({
              id: user.id,
              name: `${user.firstName} ${user.lastName[0]}. #${user.id}`,
            });
          }
        });
      });

      teamResponse.users = mappedUsers;

      const userRequests = await this._users.findByIds(team?.requests!);
      teamResponse.requests = userRequests.map((user) => {
        return {
          id: user.id,
          name: `${user.firstName} ${user.lastName[0]}. #${user.id}`,
        };
      });

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

    if (team?.users[0].toString() !== user.id.toString()) {
      throw new Error("You are not the owner of this team");
    }

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
