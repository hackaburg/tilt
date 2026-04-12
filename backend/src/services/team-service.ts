import { NotFoundError } from "routing-controllers";
import { Inject, Service, Token } from "typedi";
import { Repository } from "typeorm";
import { IService } from ".";
import { DatabaseServiceToken, IDatabaseService } from "./database-service";
import { Team } from "../entities/team";
import { Project } from "../entities/project";
import { UserRole } from "../entities/user-role";
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
    requestedBy: User,
  ): Promise<void>;
  /**
   * Remove user from team
   */
  removeUserFromTeam(
    teamId: number,
    userId: number,
    requestedBy: User,
  ): Promise<void>;
  /**
   * Delete single team by id
   */
  deleteTeamByID(id: number, currentUser: User): Promise<void>;
  /**
   * Request to join a team
   */
  requestToJoinTeam(teamId: number, user: User): Promise<void>;
  /**
   * Set the owner of a team
   */
  setOwner(teamId: number, userId: number, requestedBy: User): Promise<void>;
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
      relations: ["users", "requests", "owner"],
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
      relations: ["users", "requests", "owner"],
    });

    if (!originalTeam) {
      throw new NotFoundError();
    }

    const originalTeamUserIds = originalTeam?.userIds();

    // TODO test that admins and members can change the title, but not othe users
    if (
      user.role !== UserRole.Root &&
      !originalTeamUserIds!.includes(user.id)
    ) {
      throw new Error("You are not a member of this team");
    }

    return this._teams.save({
      ...originalTeam,
      ...team,
      // Use the dedicated http endpoint to change ownership
      owner: originalTeam.owner,
    });
  }

  /**
   * Creates a team.
   * @param team The team to create
   * @param user The user who wants to create a team
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
    //  - you can only own one team, just like you can only be part of one team

    if (user.team) {
      throw new Error("You are already part of a team");
    }

    if (team.teamImg === "") {
      const randomIndex = Math.floor(Math.random() * placeholder_img.length);
      team.teamImg = placeholder_img[randomIndex];
    }

    // TODO test
    team.owner = user;

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
      relations: ["users", "requests", "owner"],
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
    const team = await this._teams.findOne({
      where: { id: teamId },
      relations: ["users", "requests", "owner"],
    });

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
  public async deleteTeamByID(id: number, currentUser: User): Promise<void> {
    const team = await this._teams.findOne({
      where: { id },
      relations: ["users", "requests", "owner"],
    });

    if (
      currentUser.role !== UserRole.Root &&
      team?.owner?.id !== currentUser.id
    ) {
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
    requestedBy: User,
  ): Promise<void> {
    const team = await this._teams.findOne({
      where: { id: teamId },
      relations: ["users", "requests", "owner"],
    });

    if (team == null) {
      throw new Error(`no team with id ${teamId}`);
    }

    const isAdmin = requestedBy.role === UserRole.Root;
    const isOwner = team.owner?.id === requestedBy.id;
    if (!isAdmin && !isOwner) {
      // TODO test only admins or owners may accept requests
      throw new Error("You are not the owner of this team");
    }

    if (!team.requestUserIds().includes(userId)) {
      throw new Error(`user ${userId} did not request to join team ${teamId}`);
    }

    await this._users.update({ id: userId }, { team, teamRequest: null });

    return Promise.resolve();
  }

  /**
   * Remove a user from a team
   */
  public async removeUserFromTeam(
    teamId: number,
    userId: number,
    requestedBy: User,
  ): Promise<void> {
    const team = await this._teams.findOne({
      where: { id: teamId },
      relations: ["users", "requests", "owner"],
    });

    if (team == null) {
      throw new Error(`no team with id ${teamId}`);
    }

    const isOwner = team.owner?.id === requestedBy.id;
    const isAdmin = requestedBy.role === UserRole.Root;
    if (!isOwner && !isAdmin && userId !== requestedBy.id) {
      // TODO test removing oneself should work
      throw new Error("Only the owner may remove other users from a team");
    }

    if (team.owner?.id === userId) {
      // TODO test
      throw new Error("Make someone else owner of the team first");
    }

    if (!team.userIds().includes(userId)) {
      throw new Error(`user ${userId} is not part of the team ${teamId}`);
    }

    // TODO test success
    await this._users.update({ id: userId }, { team: null, teamRequest: null });

    return Promise.resolve();
  }

  /**
   * Set the owner of a team
   */
  public async setOwner(
    teamId: number,
    userId: number,
    requestedBy: User,
  ): Promise<void> {
    const team = await this._teams.findOne({
      where: { id: teamId },
      relations: ["users", "requests", "owner"],
    });

    if (team == null) {
      throw new Error(`No team with id ${teamId}`);
    }

    const isAdmin = requestedBy.role === UserRole.Root;
    const isOwner = team.owner?.id === requestedBy.id;
    if (!isAdmin && !isOwner) {
      // TODO test
      throw new Error("Only the owner may change the owner");
    }

    if (!team.userIds().includes(userId)) {
      // TODO test
      throw new Error(`User ${userId} is not part of the team ${teamId}`);
    }

    const newOwner = await this._users.findOneBy({ id: userId });

    if (newOwner == null) {
      throw new Error(`User ${userId} not found`);
    }

    // TODO test success
    await this._teams.update({ id: teamId }, { owner: newOwner });

    return Promise.resolve();
  }
}
