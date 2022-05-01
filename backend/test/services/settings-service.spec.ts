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
import { MockConfigurationService } from "./mock/mock-config-service";
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

    const config = new MockConfigurationService({
      config: {
        http: {
          baseURL: "",
        },
      },
    } as any);

    settingsService = new SettingsService(
      config.instance,
      database,
      logger.instance,
    );
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
        admittedEmail: {
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

    expect(settings.email.admittedEmail.htmlTemplate).toBe(
      updatedSettings.email.admittedEmail.htmlTemplate,
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
        admittedEmail: {
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

  it("adds question ordering", async () => {
    expect.assertions(2);

    const initialSettings = {
      application: {
        confirmationForm: {
          questions: [],
        },
        profileForm: {
          questions: [
            {
              configuration: {},
              description: "",
              mandatory: false,
              title: "Question 1",
            } as Question,
            {
              configuration: {},
              description: "",
              mandatory: false,
              title: "Question 2",
            } as Question,
          ],
        },
      } as any,
      email: {
        admittedEmail: {
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

    // save initial settings
    const initialSavedSettings = await settingsService.updateSettings(
      initialSettings,
    );

    // move questions around
    const questions = initialSavedSettings.application.profileForm.questions;
    const firstQuestion = questions[0];
    questions[0] = questions[1];
    questions[1] = firstQuestion;

    // this is where we're asserting on
    const settings = await settingsService.updateSettings(initialSavedSettings);
    const savedQuestions = settings.application.profileForm.questions;

    expect(savedQuestions[0].title).toEqual(questions[0].title);
    expect(savedQuestions[1].title).toEqual(questions[1].title);
  });
});
