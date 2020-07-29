import { Repository } from "typeorm";
import { Question } from "../../src/entities/question";
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

    const defaults = await settingsService.getSettings();
    const retrievedSettings = await settingsService.getSettings();
    expect(retrievedSettings).toMatchObject(defaults);
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

    const updatedSettings = {
      application: {
        confirmationForm: {
          questions: [],
        },
        profileForm: {
          questions: [],
        },
      } as any,
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
      frontend: {
        colorGradientEnd: "gradient-end",
        colorGradientStart: "gradient-start",
        colorLink: "link",
        colorLinkHover: "link-hover",
        loginSignupImage: "signup",
        sidebarImage: "sidebar",
      },
    } as Settings;

    await settingsService.updateSettings(updatedSettings);
    const settings = await settingsService.getSettings();

    expect(settings.email.forgotPasswordEmail.htmlTemplate).toBe(
      updatedSettings.email.forgotPasswordEmail.htmlTemplate,
    );
  });

  it("removes orphan questions", async () => {
    expect.assertions(2);

    const updatedSettings = {
      application: {
        confirmationForm: {
          questions: [
            {
              configuration: {},
              description: "",
              mandatory: false,
              title: "",
            } as Question,
          ],
        },
        profileForm: {
          questions: [],
        },
      } as any,
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
      frontend: {
        colorGradientEnd: "gradient-end",
        colorGradientStart: "gradient-start",
        colorLink: "link",
        colorLinkHover: "link-hover",
        loginSignupImage: "signup",
        sidebarImage: "sidebar",
      },
    } as Settings;

    await settingsService.updateSettings(updatedSettings);
    const settingsWithQuestion = await settingsService.getSettings();
    expect(
      settingsWithQuestion.application.confirmationForm.questions,
    ).toHaveLength(1);

    updatedSettings.application.confirmationForm.questions = [];
    await settingsService.updateSettings(updatedSettings);
    const settiingsWithoutQuestion = await settingsService.getSettings();

    expect(
      settiingsWithoutQuestion.application.confirmationForm.questions,
    ).toHaveLength(0);
  });
});
