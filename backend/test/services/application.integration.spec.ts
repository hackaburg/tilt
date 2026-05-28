import { User } from "../../src/entities/user";
import { Team } from "../../src/entities/team";
import { UserRole } from "../../src/entities/user-role";
import {
  ApplicationService,
  IApplicationService,
} from "../../src/services/application-service";
import { UserService } from "../../src/services/user-service";
import { TestDatabaseService } from "./mock/mock-database-service";
import { MockEmailTemplateService } from "./mock/mock-email-template-service";
import { MockLoggerService } from "./mock/mock-logger-service";
import { MockSettingsService } from "../services/mock/mock-settings-service";
import { MockQuestionGraphService } from "../services/mock/mock-question-graph-service";
import { MockHaveibeenpwnedService } from "../services/mock/mock-haveibeenpwned-service";
import { MockTokenService } from "./mock/mock-token-service";
import { MockTeamsService } from "./mock/mock-teams-service";
import { ApplicationController } from "../../src/controllers/application-controller";

// To reproduce this particular bug, we need a test setup that uses a proper
// application service and user service.
describe("Application Service Integration Spec", () => {
  let applicationService: IApplicationService;
  let database: TestDatabaseService;

  let user: User;
  let team: Team;

  let controller: ApplicationController;

  beforeAll(async () => {
    database = new TestDatabaseService();
    await database.bootstrap();
  });

  beforeEach(async () => {
    await database.nuke();

    user = new User();
    user.firstName = "";
    user.lastName = "";
    user.email = "";
    user.password = "";
    user.role = UserRole.User;
    user.verifyToken = "";
    user.tokenSecret = "";
    user.forgotPasswordToken = "";

    const userRepo = database.getRepository(User);
    const savedUser = await userRepo.save(user);

    // Create team for the user
    team = new Team();
    team.title = "";
    team.description = "";
    team.teamImg = "";
    const teamRepo = database.getRepository(Team);
    team.owner = savedUser;
    team = await teamRepo.save(team);

    user.team = team;
    user = await userRepo.save(user);

    const emails = new MockEmailTemplateService();
    const userService = new UserService(
      new MockHaveibeenpwnedService().instance,
      database,
      new MockLoggerService().instance,
      new MockTokenService().instance,
      emails.instance,
    );

    const settingsService = new MockSettingsService();
    settingsService.mocks.getSettings.mockResolvedValue({
      application: { hoursToConfirm: 24 },
    } as any);

    applicationService = new ApplicationService(
      new MockQuestionGraphService().instance,
      database,
      settingsService.instance,
      userService,
      emails.instance,
    );
    await applicationService.bootstrap();
    await userService.bootstrap();

    controller = new ApplicationController(
      applicationService,
      userService,
      new MockTeamsService().instance,
    );
  });

  it("does not clear team and teamRequest on checkIn", async () => {
    expect.assertions(1);

    await applicationService.checkIn(user);

    const userRepo = database.getRepository(User);
    const foundUser = await userRepo.findOne({ where: { id: user.id } });
    expect(foundUser?.team?.id).toEqual(team.id);
  });

  it("does not clear team and teamRequest on admit", async () => {
    // Based on a bug. team relation was not included in findUsersByIDs,
    // team got overwritten with null on update
    expect.assertions(1);
    await controller.admit({ data: [user.id] });

    const userRepo = database.getRepository(User);
    const foundUser = await userRepo.findOne({ where: { id: user.id } });
    expect(foundUser?.team?.id).toEqual(team.id);
  });
});
