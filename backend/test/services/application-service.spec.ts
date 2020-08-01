import {
  IChoicesQuestionConfiguration,
  INumberQuestionConfiguration,
  ITextQuestionConfiguration,
  Question,
} from "../../src/entities/question";
import { QuestionType } from "../../src/entities/question-type";
import { User } from "../../src/entities/user";
import { UserRole } from "../../src/entities/user-role";
import {
  ApplicationService,
  IApplicationService,
} from "../../src/services/application-service";
import {
  IQuestionGraphService,
  QuestionGraphService,
} from "../../src/services/question-service";
import {
  ISettingsService,
  SettingsService,
} from "../../src/services/settings-service";
import { TestDatabaseService } from "./mock/mock-database-service";
import { MockLoggerService } from "./mock/mock-logger-service";

describe(ApplicationService.name, () => {
  let service: IApplicationService;
  let questionGraph: IQuestionGraphService;
  let database: TestDatabaseService;

  /**
   * A non-mocked / actual settings service. We can't use a mocked service here,
   * since our database schema relies on existing questions through foreign keys
   */
  let settings: ISettingsService;
  let user: User;

  const createQuestion = <T>(): Question<T> => {
    const question = new Question<T>();
    question.description = "";
    question.mandatory = false;
    question.title = "";
    return question;
  };

  const createTextQuestion = (): Question<ITextQuestionConfiguration> => {
    const question = createQuestion<ITextQuestionConfiguration>();

    question.configuration = {
      convertAnswerToUrl: false,
      multiline: false,
      placeholder: "",
      type: QuestionType.Text,
    };

    return question;
  };

  /**
   * TypeORM and SQLite3 drop milliseconds by default. Instead of fixing the
   * root cause, we'll fight symptoms, since relying on timestamps alone is
   * flaky anyways, and patch the `settings.getSettings` method manually.
   * @warning This relies on resetting `settings` for each test
   */
  const patchSettingsServiceToReturnProfileFormQuestionsFromTheFuture = async (): Promise<
    void
  > => {
    const currentSettings = await settings.getSettings();
    currentSettings.application.profileForm.questions.push(
      createTextQuestion(),
    );
    await settings.updateSettings(currentSettings);

    const updatedSettings = await settings.getSettings();
    const questions = updatedSettings.application.profileForm.questions;
    const lastQuestion = questions[questions.length - 1];
    const oneDay = 24 * 60 * 60 * 1000;
    (lastQuestion as any).createdAt = new Date(
      lastQuestion.createdAt.getTime() + oneDay,
    );

    settings.getSettings = async () => updatedSettings;
  };

  const oneWeekMS = 7 * 24 * 60 * 60 * 1000;
  const todayNextWeek = new Date(Date.now() + oneWeekMS);
  const todayLastWeek = new Date(Date.now() - oneWeekMS);
  const todayInTwoWeeks = new Date(todayNextWeek.getTime() + oneWeekMS);

  beforeAll(async () => {
    database = new TestDatabaseService();
    await database.bootstrap();
  });

  beforeEach(async () => {
    await database.nuke();

    user = new User();
    user.email = "";
    user.password = "";
    user.role = UserRole.User;
    user.verifyToken = "";

    const userRepo = database.getRepository(User);
    await userRepo.save(user);

    questionGraph = new QuestionGraphService();
    await questionGraph.bootstrap();

    const logger = new MockLoggerService();
    settings = new SettingsService(database, logger.instance);
    await settings.bootstrap();

    service = new ApplicationService(questionGraph, database, settings);
    await service.bootstrap();
  });

  it("returns all profile questions", async () => {
    expect.assertions(1);

    const temporarySettings = await settings.getSettings();
    temporarySettings.application.profileForm.questions = [
      createTextQuestion(),
      createTextQuestion(),
      createTextQuestion(),
    ];
    await settings.updateSettings(temporarySettings);

    const form = await service.getProfileForm(user);
    expect(form.questions).toHaveLength(
      temporarySettings.application.profileForm.questions.length,
    );
  });

  it("returns only profile questions the user saw when they submitted it first", async () => {
    expect.assertions(2);

    const temporarySettings = await settings.getSettings();
    temporarySettings.application.allowProfileFormFrom = todayLastWeek;
    temporarySettings.application.allowProfileFormUntil = todayNextWeek;
    temporarySettings.application.profileForm.questions = [
      createTextQuestion(),
    ];
    await settings.updateSettings(temporarySettings);

    const initialForm = await service.getProfileForm(user);
    await service.storeProfileFormAnswers(user, [
      {
        questionID: initialForm.questions[0].id,
        value: "test",
      },
    ]);

    await patchSettingsServiceToReturnProfileFormQuestionsFromTheFuture();
    const updatedButSameForm = await service.getProfileForm(user);

    expect(updatedButSameForm.questions).toHaveLength(1);
    expect(updatedButSameForm.questions[0].id).toBe(
      initialForm.questions[0].id,
    );
  });

  it("prevents early profile form submissions", async () => {
    expect.assertions(1);

    const temporarySettings = await settings.getSettings();
    temporarySettings.application.allowProfileFormFrom = todayNextWeek;
    temporarySettings.application.allowProfileFormUntil = todayInTwoWeeks;
    temporarySettings.application.profileForm.questions = [
      createTextQuestion(),
      createTextQuestion(),
      createTextQuestion(),
    ];
    await settings.updateSettings(temporarySettings);

    await expect(
      service.storeProfileFormAnswers(user, []),
    ).rejects.toBeDefined();
  });

  it("prevents late profile form submissions", async () => {
    expect.assertions(1);

    const todayBefore2Weeks = new Date(todayLastWeek.getTime() - oneWeekMS);
    const temporarySettings = await settings.getSettings();
    temporarySettings.application.allowProfileFormFrom = todayBefore2Weeks;
    temporarySettings.application.allowProfileFormUntil = todayLastWeek;
    temporarySettings.application.profileForm.questions = [
      createTextQuestion(),
      createTextQuestion(),
      createTextQuestion(),
    ];
    await settings.updateSettings(temporarySettings);

    await expect(
      service.storeProfileFormAnswers(user, []),
    ).rejects.toBeDefined();
  });

  it("enforces answers to mandatory non-conditional questions", async () => {
    expect.assertions(1);

    const temporarySettings = await settings.getSettings();
    temporarySettings.application.allowProfileFormFrom = todayLastWeek;
    temporarySettings.application.allowProfileFormUntil = todayInTwoWeeks;

    const question = createTextQuestion();
    question.mandatory = true;

    temporarySettings.application.profileForm.questions = [
      question,
      createTextQuestion(),
    ];
    const storedSettings = await settings.updateSettings(temporarySettings);
    const nonMandatoryQuestionID =
      storedSettings.application.profileForm.questions[1].id;

    await expect(
      service.storeProfileFormAnswers(user, [
        {
          questionID: nonMandatoryQuestionID,
          value: "ok",
        },
      ]),
    ).rejects.toBeDefined();
  });

  it("it enforces answers to mandatory conditional questions", async () => {
    expect.assertions(1);

    const temporarySettings = await settings.getSettings();
    temporarySettings.application.allowProfileFormFrom = todayLastWeek;
    temporarySettings.application.allowProfileFormUntil = todayInTwoWeeks;

    const createMandatoryQuestion = () => {
      const question = createTextQuestion();
      question.mandatory = true;
      return question;
    };

    temporarySettings.application.profileForm.questions = [
      createMandatoryQuestion(),
      createMandatoryQuestion(),
    ];
    const storedSettings = await settings.updateSettings(temporarySettings);

    const parent = storedSettings.application.profileForm.questions[0];
    const child = storedSettings.application.profileForm.questions[1];

    const expectedParentValue = "expected";
    child.showIfParentHasValue = expectedParentValue;
    child.parentID = parent.id;
    await settings.updateSettings(storedSettings);

    await expect(
      service.storeProfileFormAnswers(user, [
        {
          questionID: parent.id,
          value: expectedParentValue,
        },
      ]),
    ).rejects.toBeDefined();
  });

  it("it ignores missing answers to mandatory conditional questions if the question wasn't shown", async () => {
    expect.assertions(1);

    const temporarySettings = await settings.getSettings();
    temporarySettings.application.allowProfileFormFrom = todayLastWeek;
    temporarySettings.application.allowProfileFormUntil = todayInTwoWeeks;

    const createMandatoryQuestion = () => {
      const question = createTextQuestion();
      question.mandatory = true;
      return question;
    };

    temporarySettings.application.profileForm.questions = [
      createMandatoryQuestion(),
      createMandatoryQuestion(),
    ];
    const storedSettings = await settings.updateSettings(temporarySettings);

    const parent = storedSettings.application.profileForm.questions[0];
    const child = storedSettings.application.profileForm.questions[1];

    child.showIfParentHasValue = "expected";
    child.parentID = parent.id;
    await settings.updateSettings(storedSettings);

    await expect(
      service.storeProfileFormAnswers(user, [
        {
          questionID: parent.id,
          value: "not expected",
        },
      ]),
    ).resolves.toBeUndefined();
  });

  it("validates text questions", async () => {
    expect.assertions(2);

    const question = createQuestion<ITextQuestionConfiguration>();
    question.configuration = {
      convertAnswerToUrl: false,
      multiline: false,
      placeholder: "",
      type: QuestionType.Text,
    };

    const temporarySettings = await settings.getSettings();
    temporarySettings.application.allowProfileFormFrom = todayLastWeek;
    temporarySettings.application.allowProfileFormUntil = todayInTwoWeeks;
    temporarySettings.application.profileForm.questions = [question];
    const storedSettings = await settings.updateSettings(temporarySettings);
    const questionID = storedSettings.application.profileForm.questions[0].id;

    await expect(
      service.storeProfileFormAnswers(user, [
        {
          questionID,
          value: "     ",
        },
      ]),
    ).rejects.toBeDefined();

    await expect(
      service.storeProfileFormAnswers(user, [
        {
          questionID,
          value: "seems about right",
        },
      ]),
    ).resolves.toBeUndefined();
  });

  it("validates numbeer questions", async () => {
    expect.assertions(4);

    const question = createQuestion<INumberQuestionConfiguration>();
    question.configuration = {
      allowDecimals: false,
      maxValue: 100,
      minValue: 0,
      placeholder: "",
      type: QuestionType.Number,
    };

    const temporarySettings = await settings.getSettings();
    temporarySettings.application.allowProfileFormFrom = todayLastWeek;
    temporarySettings.application.allowProfileFormUntil = todayInTwoWeeks;
    temporarySettings.application.profileForm.questions = [question];
    const storedSettings = await settings.updateSettings(temporarySettings);
    const questionID = storedSettings.application.profileForm.questions[0].id;

    await expect(
      service.storeProfileFormAnswers(user, [
        {
          questionID,
          value: "3.5",
        },
      ]),
    ).rejects.toBeDefined();

    await expect(
      service.storeProfileFormAnswers(user, [
        {
          questionID,
          value: "-1",
        },
      ]),
    ).rejects.toBeDefined();

    await expect(
      service.storeProfileFormAnswers(user, [
        {
          questionID,
          value: "9001",
        },
      ]),
    ).rejects.toBeDefined();

    await expect(
      service.storeProfileFormAnswers(user, [
        {
          questionID,
          value: "50",
        },
      ]),
    ).resolves.toBeUndefined();
  });

  it("validates choices questions", async () => {
    expect.assertions(5);

    const choices = ["Cat", "Dog", "Bird"];

    const multipleAnswers = createQuestion<IChoicesQuestionConfiguration>();
    multipleAnswers.configuration = {
      allowMultiple: true,
      choices,
      displayAsDropdown: false,
      type: QuestionType.Choices,
    };

    const singleAnswer = createQuestion<IChoicesQuestionConfiguration>();
    singleAnswer.configuration = {
      allowMultiple: false,
      choices,
      displayAsDropdown: false,
      type: QuestionType.Choices,
    };

    const temporarySettings = await settings.getSettings();
    temporarySettings.application.allowProfileFormFrom = todayLastWeek;
    temporarySettings.application.allowProfileFormUntil = todayInTwoWeeks;
    temporarySettings.application.profileForm.questions = [
      multipleAnswers,
      singleAnswer,
    ];
    const storedSettings = await settings.updateSettings(temporarySettings);

    const multipleAnswersQuestionID = storedSettings.application.profileForm.questions.find(
      ({ configuration }) =>
        configuration.type === QuestionType.Choices &&
        configuration.allowMultiple,
    )!.id;

    const singleAnswerQuestionID = storedSettings.application.profileForm.questions.find(
      ({ configuration }) =>
        configuration.type === QuestionType.Choices &&
        !configuration.allowMultiple,
    )!.id;

    await expect(
      service.storeProfileFormAnswers(user, [
        {
          questionID: multipleAnswersQuestionID,
          // no option selected, but not mandatory
          value: "",
        },
      ]),
    ).resolves.toBeUndefined();

    await expect(
      service.storeProfileFormAnswers(user, [
        {
          questionID: multipleAnswersQuestionID,
          // invalid options selected
          value: "Fish,Tree",
        },
      ]),
    ).rejects.toBeDefined();

    await expect(
      service.storeProfileFormAnswers(user, [
        {
          questionID: multipleAnswersQuestionID,
          // valid options
          value: "Dog,Cat",
        },
      ]),
    ).resolves.toBeUndefined();

    await expect(
      service.storeProfileFormAnswers(user, [
        {
          questionID: singleAnswerQuestionID,
          // multiple options
          value: "Dog,Cat",
        },
      ]),
    ).rejects.toBeDefined();

    await expect(
      service.storeProfileFormAnswers(user, [
        {
          questionID: singleAnswerQuestionID,
          // valid option
          value: "Dog",
        },
      ]),
    ).resolves.toBeUndefined();
  });

  it("requires users to be admitted to see the confirmation form", async () => {
    expect.assertions(3);

    const temporarySettings = await settings.getSettings();
    temporarySettings.application.allowProfileFormFrom = todayLastWeek;
    temporarySettings.application.allowProfileFormUntil = todayNextWeek;
    await settings.updateSettings(temporarySettings);

    // no existing application
    await expect(service.getConfirmationForm(user)).rejects.toBeDefined();

    await service.getProfileForm(user);

    // not admitted yet
    await expect(service.getConfirmationForm(user)).rejects.toBeDefined();

    await service.storeProfileFormAnswers(user, []);
    await service.admit(user);

    await expect(service.getConfirmationForm(user)).resolves.toBeDefined();
  });

  it("returns all confirmation questions", async () => {
    expect.assertions(1);

    const temporarySettings = await settings.getSettings();
    temporarySettings.application.allowProfileFormFrom = todayLastWeek;
    temporarySettings.application.allowProfileFormUntil = todayNextWeek;
    temporarySettings.application.profileForm.questions = [
      createTextQuestion(),
    ];
    temporarySettings.application.confirmationForm.questions = [
      createTextQuestion(),
    ];
    await settings.updateSettings(temporarySettings);

    // no need for question ids, since neither are mandatory
    await service.storeProfileFormAnswers(user, []);

    await service.admit(user);
    const { questions } = await service.getConfirmationForm(user);

    expect(questions).toHaveLength(1);
  });

  it("returns profile questions for the confirmation form when they weren't asked in the profile form", async () => {
    expect.assertions(3);

    const temporarySettings = await settings.getSettings();
    temporarySettings.application.allowProfileFormFrom = todayLastWeek;
    temporarySettings.application.allowProfileFormUntil = todayNextWeek;
    temporarySettings.application.profileForm.questions = [
      createTextQuestion(),
    ];
    temporarySettings.application.confirmationForm.questions = [
      createTextQuestion(),
    ];
    await settings.updateSettings(temporarySettings);

    // no need for question ids, since neither are mandatory
    await service.storeProfileFormAnswers(user, []);

    await patchSettingsServiceToReturnProfileFormQuestionsFromTheFuture();

    await service.admit(user);
    const { questions } = await service.getConfirmationForm(user);

    expect(questions).toHaveLength(2);

    const updatedSettings = await settings.getSettings();
    expect(questions[0].id).toBe(
      updatedSettings.application.profileForm.questions[1].id,
    );
    expect(questions[1].id).toBe(
      updatedSettings.application.confirmationForm.questions[0].id,
    );
  });

  it("requires users to be admitted to fill out the confirmation form", async () => {
    expect.assertions(2);

    const temporarySettings = await settings.getSettings();
    temporarySettings.application.allowProfileFormFrom = todayLastWeek;
    temporarySettings.application.allowProfileFormUntil = todayNextWeek;
    await settings.updateSettings(temporarySettings);

    await service.storeProfileFormAnswers(user, []);

    await expect(
      service.storeConfirmationFormAnswers(user, []),
    ).rejects.toBeDefined();

    await service.admit(user);

    await expect(
      service.storeConfirmationFormAnswers(user, []),
    ).resolves.toBeUndefined();
  });

  it("prevents confirming after the deadline", async () => {
    expect.assertions(1);

    const temporarySettings = await settings.getSettings();
    temporarySettings.application.allowProfileFormFrom = todayLastWeek;
    temporarySettings.application.allowProfileFormUntil = todayNextWeek;
    // basically "confirm by yesterday"
    temporarySettings.application.hoursToConfirm = -24;
    await settings.updateSettings(temporarySettings);

    await service.storeProfileFormAnswers(user, []);
    await service.admit(user);

    await expect(
      service.storeConfirmationFormAnswers(user, []),
    ).rejects.toBeDefined();
  });
});
