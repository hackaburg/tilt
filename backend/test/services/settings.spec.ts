import { Repository } from "typeorm";
import { IEmailTemplates } from "../../../types/settings";
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

  it("updates email templates", async () => {
    expect.assertions(2);

    const updatedTemplates: Partial<IEmailTemplates> = {
      verifyEmail: {
        htmlTemplate: "foo",
        textTemplate: "bar",
      },
    };

    await settingsService.updateEmailTemplates(updatedTemplates);
    const settings = await settingsService.getSettings();

    expect(settings.email.templates.verifyEmail.htmlTemplate).toBe(updatedTemplates.verifyEmail!.htmlTemplate);
    expect(settings.email.templates.verifyEmail.textTemplate).toBe(updatedTemplates.verifyEmail!.textTemplate);
  });

  it("doesn't pollute other settings by updating email templates", async () => {
    expect.assertions(2);

    type PollutedEmailSettings = Partial<IEmailTemplates> & {
      foo: string;
      verifyEmail: {
        bar: string;
      }
    };

    const updatedTemplates: PollutedEmailSettings = {
      foo: "test",
      verifyEmail: {
        bar: "test",
        htmlTemplate: "foo",
        textTemplate: "bar",
      },
    };

    await settingsService.updateEmailTemplates(updatedTemplates);
    const settings = await settingsService.getSettings();
    const emailSettings = settings.email.templates as PollutedEmailSettings;

    expect(emailSettings.foo).not.toBeDefined();
    expect(emailSettings.verifyEmail.bar).not.toBeDefined();
  });
});
