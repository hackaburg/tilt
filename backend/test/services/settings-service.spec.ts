import { Repository } from "typeorm";
import { IRecursivePartial } from "../../../types/api";
import { ISettings } from "../../../types/settings";
import { Settings } from "../../src/entities/settings";
import { IDatabaseService } from "../../src/services/database-service";
import { ILoggerService } from "../../src/services/logger-service";
import {
  ISettingsService,
  SettingsService,
} from "../../src/services/settings-service";
import { MockedService } from "./mock";
import { TestDatabaseService } from "./mock/mock-database-service";
import { MockLoggerService } from "./mock/mock-logger-service";

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
    await settingsRepo.clear();
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

  it("updates settings", async () => {
    expect.assertions(1);

    const updatedSettings: IRecursivePartial<ISettings> = {
      email: {
        forgotPasswordEmail: {
          htmlTemplate: "foo",
          subject: "bar",
          textTemplate: "foobar",
        },
        sender: "test@foo.bar",
        verifyEmail: {
          htmlTemplate: "foo",
          subject: "bar",
          textTemplate: "foobar",
        },
      },
    };

    await settingsService.updateSettings(updatedSettings);
    const settings = await settingsService.getSettings();

    expect(settings).toMatchObject(updatedSettings);
  });

  it("doesn't pollute other settings by updating settings", async () => {
    expect.assertions(2);

    type PollutedSettings = Partial<ISettings> & {
      foo: string;
      email: {
        bar: string;
      };
    };

    const updatedSettings: IRecursivePartial<PollutedSettings> = {
      email: {
        bar: "test",
      },
      foo: "test",
    };

    await settingsService.updateSettings(updatedSettings);
    const settings = (await settingsService.getSettings()) as PollutedSettings;

    expect(settings.foo).not.toBeDefined();
    expect(settings.email.bar).not.toBeDefined();
  });
});
