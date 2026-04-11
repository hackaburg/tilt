import { NotFoundError } from "routing-controllers";
import { Inject, Service, Token } from "typedi";
import { Repository } from "typeorm";
import { IService } from ".";
import { DatabaseServiceToken, IDatabaseService } from "./database-service";
import { Team } from "../entities/team";
import { Project } from "../entities/project";
import {
  TeamResponseDTO,
  convertBetweenEntityAndDTO,
} from "../controllers/dto";
import { User } from "../entities/user";
import { hasSameElements } from "../utils/has-same-elements";

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
  createTeam(team: Team, user: User): Promise<Team>;
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
  private _projects!: Repository<Project>;

  public constructor(
    @Inject(DatabaseServiceToken) private readonly _database: IDatabaseService,
  ) {}

  /**
   * Sets up the user service.
   */
  public async bootstrap(): Promise<void> {
    this._teams = this._database.getRepository(Team);
    this._users = this._database.getRepository(User);
    this._projects = this._database.getRepository(Project);
  }

  /**
   * Gets all teams.
   */
  public async getAllTeams(): Promise<readonly Team[]> {
    return this._database.getRepository(Team).find({
      relations: ["users", "requests"],
    });
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

    const originalTeam = await this._teams.findOne({
      where: { id: team.id },
      relations: ["users", "requests"],
    });

    if (!originalTeam) {
      throw new NotFoundError();
    }

    const originalTeamUserIds = originalTeam?.userIds();

    if (!originalTeamUserIds!.includes(user.id)) {
      throw new Error("You are not a member of this team");
    }

    if (!hasSameElements(originalTeam.userIds(), team.userIds())) {
      const isAdmin = originalTeam!.userIds()[0] !== user.id;
      if (isAdmin) {
        throw new Error("You are not the owner of this team");
      }
    }

    return this._teams.save(team);
  }

  /**
   * Creates a team.
   * @param team The team to create
   */
  public async createTeam(team: Team, user: User): Promise<Team> {
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

    // TODO leaving team should make someone else owner
    // TODO order of team.users not guaranteed anymore I guess,
    //  - add owner and edit all usages of users[0].
    //  - a team owner also has to be part of the team, I suppose
    //  - you can only own one team, just like you can only be part of one team

    if (user.team) {
      throw new Error("You are already part of a team");
    }

    if (team.teamImg === "") {
      team.teamImg =
        placeholder_img[Math.floor(Math.random() * placeholder_img.length)];
    }

    const createdTeam = await this._teams.save(team);

    // TODO test
    user.team = createdTeam;
    await this._users.save(user);

    // Every team gets one project by default
    const project = new Project();
    project.title = `${team.title}'s Project`;
    project.description = "";
    project.team = createdTeam;
    project.allowRating = false;
    await this._projects.save(project);

    return createdTeam;
  }

  /**
   * Gets a team by its id.
   * @param id The id of the team
   */
  public async getTeamByID(id: number): Promise<TeamResponseDTO | undefined> {
    const team = await this._teams.findOne({
      where: { id },
      relations: ["users", "requests"],
    });

    if (team == null) {
      return undefined;
    }

    return convertBetweenEntityAndDTO(team, TeamResponseDTO);
  }

  /**
   * Requests to join a team.
   * @param teamId The id of the team
   * @param user The user requesting to join
   */
  public async requestToJoinTeam(teamId: number, user: User): Promise<void> {
    const team = await this._teams.findOneBy({ id: teamId });

    if (team == null) {
      throw new Error(`no team with id ${teamId}`);
    }

    const requests = team.requestUserIds();

    if (requests.includes(user.id)) {
      throw new Error(
        `user ${user.id} already requested to join team ${teamId}`,
      );
    }

    await this._users.save({
      ...user,
      teamRequest: team,
    });

    return Promise.resolve();
  }

  /**
   * Deletes a team by its id.
   * @param id The id of the team
   */
  public async deleteTeamByID(id: number, currentUserId: User): Promise<void> {
    const team = await this._teams.findOne({
      where: { id },
      relations: ["users", "requests"],
    });

    // TODO ownerid
    if (team?.users[0].id !== currentUserId.id) {
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
    owner: User,
  ): Promise<void> {
    const team = await this._teams.findOne({
      where: { id: teamId },
      relations: ["users", "requests"],
    });

    if (team == null) {
      throw new Error(`no team with id ${teamId}`);
    }

    if (team?.users[0].id !== owner.id) {
      throw new Error("You are not the owner of this team");
    }

    if (!team.requestUserIds().includes(userId)) {
      throw new Error(`user ${userId} did not request to join team ${teamId}`);
    }

    await this._users.update({ id: userId }, { team, teamRequest: null });

    return Promise.resolve();
  }
}
