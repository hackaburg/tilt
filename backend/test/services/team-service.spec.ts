import { Repository } from "typeorm";
import { Project } from "../../src/entities/project";
import { Team } from "../../src/entities/team";
import { User } from "../../src/entities/user";
import { TeamService, ITeamService } from "../../src/services/team-service";
import { TestDatabaseService } from "./mock/mock-database-service";
import { UserRole } from "../../src/entities/user-role";

describe("TeamService", () => {
  let teamService: ITeamService;
  let database: TestDatabaseService;
  let userRepo: Repository<User>;
  let teamRepo: Repository<Team>;

  const makeUser = (email: string, role = UserRole.User): User => {
    const user = new User();
    user.firstName = "Test";
    user.lastName = "User";
    user.email = email;
    user.password = "";
    user.role = role;
    user.verifyToken = "";
    user.tokenSecret = "";
    user.forgotPasswordToken = "";
    user.team = null;
    user.teamRequest = null;
    return user;
  };

  const makeTeam = (title = "Test Team"): Team => {
    const team = new Team();
    team.title = title;
    team.teamImg = "";
    team.description = "A test team";
    return team;
  };

  beforeAll(async () => {
    database = new TestDatabaseService();
    await database.bootstrap();
  });

  beforeEach(async () => {
    await database.nuke();
    teamService = new TeamService(database);
    await teamService.bootstrap();
    userRepo = database.getRepository(User);
    teamRepo = database.getRepository(Team);
  });

  describe("createTeam", () => {
    it("creates a default project", async () => {
      const projectRepo = database.getRepository(Project);
      expect(await projectRepo.count()).toEqual(0);

      const user = await userRepo.save(makeUser("user@test.com"));

      const team = makeTeam("Team 1");
      await teamService.createTeam(team, user);

      const projects = await projectRepo.find();
      expect(projects).toHaveLength(1);
      expect(projects[0].team.title).toEqual(team.title);
    });

    it("sets the creator as the team owner", async () => {
      expect.assertions(1);

      const user = await userRepo.save(makeUser("owner@test.com"));
      const createdTeam = await teamService.createTeam(makeTeam(), user);

      const foundTeam = await teamRepo.findOne({
        where: { id: createdTeam.id },
        relations: ["owner"],
      });

      expect(foundTeam!.owner.id).toEqual(user.id);
    });

    it("assigns the newly created team to the user", async () => {
      expect.assertions(1);

      const user = await userRepo.save(makeUser("member@test.com"));
      const createdTeam = await teamService.createTeam(makeTeam(), user);

      const updatedUser = await userRepo.findOne({ where: { id: user.id } });
      expect(updatedUser!.team!.id).toEqual(createdTeam.id);
    });
  });

  describe("requestToJoinTeam", () => {
    it("throws when the requester is owner of a team", async () => {
      expect.assertions(1);

      const requestingUser = await userRepo.save(makeUser("req@test.com"));
      const createdTeam = await teamService.createTeam(
        makeTeam(),
        requestingUser,
      );
      await userRepo.save({ ...requestingUser, team: createdTeam });

      await expect(
        teamService.requestToJoinTeam(createdTeam.id, requestingUser),
      ).rejects.toThrow("Make someone else owner of your other team first");
    });
  });

  describe("acceptUserToTeam", () => {
    it("throws when the requester is neither owner nor admin", async () => {
      expect.assertions(1);

      const owner = await userRepo.save(makeUser("owner@test.com"));
      const requestingUser = await userRepo.save(makeUser("req@test.com"));
      const randomUser = await userRepo.save(makeUser("random@test.com"));

      const createdTeam = await teamService.createTeam(makeTeam(), owner);

      await userRepo.save({ ...requestingUser, teamRequest: createdTeam });

      await expect(
        teamService.acceptUserToTeam(
          createdTeam.id,
          requestingUser.id,
          randomUser,
        ),
      ).rejects.toThrow("You are not the owner of this team");
    });

    it("allows the team owner to accept a join request", async () => {
      expect.assertions(2);

      const owner = await userRepo.save(makeUser("owner@test.com"));
      const requestingUser = await userRepo.save(makeUser("req@test.com"));

      const createdTeam = await teamService.createTeam(makeTeam(), owner);
      await userRepo.save({ ...requestingUser, teamRequest: createdTeam });

      await teamService.acceptUserToTeam(
        createdTeam.id,
        requestingUser.id,
        owner,
      );

      const acceptedUser = await userRepo.findOne({
        where: { id: requestingUser.id },
      });
      expect(acceptedUser!.team!.id).toEqual(createdTeam.id);
      expect(acceptedUser!.teamRequest).toBeNull();
    });

    it("allows an admin to accept a join request", async () => {
      expect.assertions(2);

      const owner = await userRepo.save(makeUser("owner@test.com"));
      const admin = await userRepo.save(
        makeUser("admin@test.com", UserRole.Root),
      );
      const requestingUser = await userRepo.save(makeUser("req@test.com"));

      const createdTeam = await teamService.createTeam(makeTeam(), owner);
      await userRepo.save({ ...requestingUser, teamRequest: createdTeam });

      await teamService.acceptUserToTeam(
        createdTeam.id,
        requestingUser.id,
        admin,
      );

      const acceptedUser = await userRepo.findOne({
        where: { id: requestingUser.id },
      });
      expect(acceptedUser!.team!.id).toEqual(createdTeam.id);
      expect(acceptedUser!.teamRequest).toBeNull();
    });
  });

  describe("removeUserFromTeam", () => {
    it("allows a user to remove themselves from a team", async () => {
      expect.assertions(1);

      const owner = await userRepo.save(makeUser("owner@test.com"));
      const member = await userRepo.save(makeUser("member@test.com"));

      const createdTeam = await teamService.createTeam(makeTeam(), owner);
      await userRepo.save({ ...member, team: createdTeam });

      await teamService.removeUserFromTeam(createdTeam.id, member.id, member);

      const updatedMember = await userRepo.findOne({
        where: { id: member.id },
      });
      expect(updatedMember!.team).toBeNull();
    });

    it("throws when trying to remove the team owner", async () => {
      expect.assertions(1);

      const owner = await userRepo.save(makeUser("owner@test.com"));
      const createdTeam = await teamService.createTeam(makeTeam(), owner);

      await expect(
        teamService.removeUserFromTeam(createdTeam.id, owner.id, owner),
      ).rejects.toThrow("Make someone else owner of the team first");
    });

    it("removes a member from the team successfully", async () => {
      expect.assertions(1);

      const owner = await userRepo.save(makeUser("owner@test.com"));
      const member = await userRepo.save(makeUser("member@test.com"));

      const createdTeam = await teamService.createTeam(makeTeam(), owner);
      await userRepo.save({ ...member, team: createdTeam });

      await teamService.removeUserFromTeam(createdTeam.id, member.id, owner);

      const updatedMember = await userRepo.findOne({
        where: { id: member.id },
      });
      expect(updatedMember!.team).toBeNull();
    });

    it("throws when trying to remove users from other teams", async () => {
      expect.assertions(1);

      const t1Owner = await userRepo.save(makeUser("t1Owner@test.com"));
      const t1Member = await userRepo.save(makeUser("t1Member@test.com"));
      const t1 = await teamService.createTeam(makeTeam(), t1Owner);
      await userRepo.save({ ...t1Member, team: t1 });

      const t2Owner = await userRepo.save(makeUser("t2Owner@test.com"));
      const t2Member = await userRepo.save(makeUser("t2Member@test.com"));
      const t2 = await teamService.createTeam(makeTeam(), t2Owner);
      await userRepo.save({ ...t2Member, team: t2 });

      await expect(
        teamService.removeUserFromTeam(t1.id, t1Member.id, t2Owner),
      ).rejects.toThrow("Only the owner may remove other users from a team");
    });
  });

  describe("setOwner", () => {
    it("throws when the requester is neither owner nor admin", async () => {
      expect.assertions(1);

      const owner = await userRepo.save(makeUser("owner@test.com"));
      const member = await userRepo.save(makeUser("member@test.com"));
      const randomUser = await userRepo.save(makeUser("random@test.com"));

      const createdTeam = await teamService.createTeam(makeTeam(), owner);
      await userRepo.save({ ...member, team: createdTeam });

      await expect(
        teamService.setOwner(createdTeam.id, member.id, randomUser),
      ).rejects.toThrow("Only the owner may change the owner");
    });

    it("throws when the target user is not in the team", async () => {
      expect.assertions(1);

      const owner = await userRepo.save(makeUser("owner@test.com"));
      const outsider = await userRepo.save(makeUser("outsider@test.com"));

      const createdTeam = await teamService.createTeam(makeTeam(), owner);

      await expect(
        teamService.setOwner(createdTeam.id, outsider.id, owner),
      ).rejects.toThrow(
        `User ${outsider.id} is not part of the team ${createdTeam.id}`,
      );
    });

    it("sets the new owner successfully", async () => {
      expect.assertions(1);

      const owner = await userRepo.save(makeUser("owner@test.com"));
      const member = await userRepo.save(makeUser("member@test.com"));

      const createdTeam = await teamService.createTeam(makeTeam(), owner);
      await userRepo.save({ ...member, team: createdTeam });

      await teamService.setOwner(createdTeam.id, member.id, owner);

      const updatedTeam = await teamRepo.findOne({
        where: { id: createdTeam.id },
        relations: ["owner"],
      });
      expect(updatedTeam!.owner.id).toEqual(member.id);
    });
  });
});
