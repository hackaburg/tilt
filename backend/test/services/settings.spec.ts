import { Repository } from "typeorm";
import { Settings } from "../../src/entities/settings";
import { IDatabaseService } from "../../src/services/database";
import { ILoggerService } from "../../src/services/log";
import { ISettingsService, SettingsService } from "../../src/services/settings";
import { MockedService } from "./mock";
import { TestDatabaseService } from "./mock/database";
import { MockLoggerService } from "./mock/logger";

describe("SettingsService", () => {
  let database: IDatabaseService;
  let settingsRepo: Repository<Settings>;
  let logger: MockedService<ILoggerService>;
  let settingsService: ISettingsService;

  beforeAll(async () => {
    database = new TestDatabaseService();
    await database.bootstrap();
    settingsRepo = database.getRepository(Settings);
  });

  beforeEach(async () => {
    logger = new MockLoggerService();
    settingsService = new SettingsService(database, logger.instance);
    await settingsService.bootstrap();
  });

  it("gets existing settings", async () => {
    expect.assertions(1);

    await settingsRepo.save(new Settings());
    const settings = await settingsRepo.findOne()!;

    const retrievedSettings = await settingsService.getSettings();
    expect(retrievedSettings).toEqual(settings);
  });

  it("loads default settings", async () => {
    expect.assertions(2);

    const settings = await settingsService.getSettings();
    expect(settings).toBeDefined();

    const settingsInTable = await settingsRepo.find();
    expect(settingsInTable).toHaveLength(1);
  });
});
