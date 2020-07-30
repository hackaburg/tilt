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

  // we can't use a mocked settings service, as questions and answers rely on the
  // database schema through foreign key relationships
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
    user.admitted = false;

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

  it("prevents early form submissions", async () => {
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

  it("prevents late form submissions", async () => {
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
          // no option selected
          value: "",
        },
      ]),
    ).rejects.toBeDefined();

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
});
