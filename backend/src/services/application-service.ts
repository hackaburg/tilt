import { Inject, Service, Token } from "typedi";
import { Repository } from "typeorm";
import { IService } from ".";
import { Answer } from "../entities/answer";
import { Application } from "../entities/application";
import { Question } from "../entities/question";
import { QuestionType } from "../entities/question-type";
import { User } from "../entities/user";
import { enforceExhaustiveSwitch } from "../utils/switch";
import { DatabaseServiceToken, IDatabaseService } from "./database-service";
import {
  IQuestionGraphService,
  QuestionGraph,
  QuestionGraphServiceToken,
} from "./question-service";
import { ISettingsService, SettingsServiceToken } from "./settings-service";

/**
 * A form containing questions and given answers.
 */
export interface IForm {
  questions: readonly Question[];
  answers: readonly Answer[];
}

/**
 * A raw answer
 */
export interface IRawAnswer {
  questionID: number;
  value: string;
}

/**
 * A service to handle applications.
 */
export interface IApplicationService extends IService {
  /**
   * Gets the profile form with the user's given answers.
   * @param user The user requesting their profile form
   */
  getProfileForm(user: User): Promise<IForm>;

  /**
   * Saves the answers for the profile form for the given user.
   * @param user The user storing their profile form
   * @param answers The given answers
   */
  storeProfileFormAnswers(
    user: User,
    answers: readonly IRawAnswer[],
  ): Promise<void>;

  /**
   * Admits the given user.
   * @param user The user to admit
   */
  admit(user: User): Promise<void>;

  /**
   * Gets the confirmation form with the user's previously given answers. This
   * form includes questions the user didn't answer in the profile form because
   * they were added after the user submitted the profile form.
   * @param user The user requesting their confirmation form
   */
  getConfirmationForm(user: User): Promise<IForm>;

  /**
   * Saves the answers for the confirmation form for the given user.
   * @param user The user storing their confirmation form
   * @param answers The given answers
   */
  storeConfirmationFormAnswers(
    user: User,
    answers: readonly IRawAnswer[],
  ): Promise<void>;
}

/**
 * A token used to inject a concrete application service.
 */
export const ApplicationServiceToken = new Token<IApplicationService>();

@Service(ApplicationServiceToken)
export class ApplicationService implements IApplicationService {
  private _applications!: Repository<Application>;

  constructor(
    @Inject(QuestionGraphServiceToken)
    private readonly _graph: IQuestionGraphService,
    @Inject(DatabaseServiceToken) private readonly _database: IDatabaseService,
    @Inject(SettingsServiceToken) private readonly _settings: ISettingsService,
  ) {}

  /**
   * @inheritdoc
   */
  public async bootstrap(): Promise<void> {
    this._applications = this._database.getRepository(Application);
  }

  /**
   * Returns whether the given question was answered correctly.
   * @param question The answered question
   * @param answer The answer to the answered question
   */
  private isAnswerValid(question: Question, answer: Answer): boolean {
    const configuration = question.configuration;

    if (!question.mandatory && answer.value === "") {
      return true;
    }

    switch (configuration.type) {
      case QuestionType.Choices:
        const parsedAnswers = answer.value.split(",");

        if (!configuration.allowMultiple && parsedAnswers.length > 1) {
          return false;
        }

        const allAnswersAreChoices = parsedAnswers.every((value) =>
          configuration.choices.includes(value),
        );

        return allAnswersAreChoices;

      case QuestionType.Country:
      case QuestionType.Text:
        return answer.value.trim().length > 0;

      case QuestionType.Number:
        const numberValue = Number(answer.value);
        const hasDecimals = Math.floor(numberValue) !== numberValue;

        if (!configuration.allowDecimals && hasDecimals) {
          return false;
        }

        const biggerThanMin =
          configuration.minValue == null ||
          configuration.minValue <= numberValue;
        const smallerThanMax =
          configuration.maxValue == null ||
          numberValue <= configuration.maxValue;

        return biggerThanMin && smallerThanMax;

      default:
        enforceExhaustiveSwitch(configuration);
        return false;
    }
  }

  /**
   * Finds the existing application of a user or `null`.
   * @param user The user requesting their application
   */
  private async findExistingApplication(
    user: User,
  ): Promise<Application | null> {
    const application = await this._applications.findOne({
      where: {
        user: {
          id: user.id,
        },
      },
    });

    if (!application) {
      return null;
    }

    return application;
  }

  /**
   * Finds an existing application or creates a new one.
   * @param user A user applying here
   */
  private async findOrCreateApplication(user: User): Promise<Application> {
    const existingApplication = await this.findExistingApplication(user);

    if (existingApplication == null) {
      const application = new Application();
      application.user = user;
      application.answers = [];

      return await this._applications.save(application);
    }

    return existingApplication;
  }

  /**
   * Resolves the given raw answers from the user to either existing @see Answer
   * entities or creates fresh ones.
   * @param application The user's application
   * @param questionGraph The question graph for the user's current form
   * @param rawAnswers The answers provided by the user
   */
  private resolveAnswersToEntities(
    application: Application,
    questionGraph: QuestionGraph,
    rawAnswers: readonly IRawAnswer[],
  ): readonly Answer[] {
    return rawAnswers.map((rawAnswer) => {
      const existingAnswer = application.answers.find(
        ({ question: { id } }) => rawAnswer.questionID === id,
      );

      if (existingAnswer) {
        existingAnswer.value = rawAnswer.value;
        return existingAnswer;
      }

      const answer = new Answer();
      answer.value = rawAnswer.value;

      const node = questionGraph.get(rawAnswer.questionID);

      if (!node) {
        throw new QuestionNotFoundError(rawAnswer.questionID);
      }

      answer.question = node.question;

      return answer;
    });
  }

  /**
   * Replaces a user's answers to a given set of questions.
   * @param application The user's application
   * @param questions A set of questions the user should answer
   * @param givenAnswers The user's new answers for these questions
   */
  private async replaceAnswers(
    application: Application,
    questions: readonly Question[],
    givenAnswers: readonly IRawAnswer[],
  ) {
    const questionGraph = this._graph.buildQuestionGraph(questions);
    const startNodes = [...questionGraph.values()].filter(
      ({ parentNode }) => parentNode == null,
    );

    const answers = this.resolveAnswersToEntities(
      application,
      questionGraph,
      givenAnswers,
    );
    const modifiedAnswers = [] as Answer[];

    for (const node of startNodes) {
      let nodesToVisit = [node];

      while (nodesToVisit.length > 0) {
        const [currentNode, ...rest] = nodesToVisit;
        nodesToVisit = [...rest, ...currentNode.childNodes];

        const currentQuestion = currentNode.question;
        const answerForCurrentQuestion = answers.find(
          ({ question: { id } }) => id === currentQuestion.id,
        );

        if (
          !answerForCurrentQuestion ||
          answerForCurrentQuestion.value === ""
        ) {
          // if a question is purely optional, we can ignore that it's missing
          if (!currentQuestion.mandatory) {
            continue;
          }

          const parentNode = currentNode.parentNode;

          // if we don't have a parent question and didn't find an answer, the
          // user didn't answer it and we expected an answer
          if (!parentNode) {
            throw new QuestionNotAnsweredError(currentQuestion.id);
          }

          const parentQuestion = parentNode.question;
          const parentAnswer = givenAnswers.find(
            ({ questionID }) => questionID === parentQuestion.id,
          );

          // we're going top-down, so we already know the parent question is valid
          if (!parentAnswer) {
            throw new QuestionGraphBrokenError();
          }

          const parentQuestionAnswerMatchedExpectedValue =
            currentQuestion.showIfParentHasValue === parentAnswer.value;

          // the question was shown, because the parent question was answered
          // with the expected value
          // consider this question:
          //
          //    What's your profession? [ ] Student     [ ] Professional
          //
          // if we want to ask which semester a student is in, we expect
          // "Student" and thus require the question to be answered
          if (parentQuestionAnswerMatchedExpectedValue) {
            throw new QuestionNotAnsweredError(currentQuestion.id);
          }

          // the question might be mandatory, but we didn't show it to the user
          // in the first place, therefore we can ignore it
          continue;
        }

        if (!this.isAnswerValid(currentQuestion, answerForCurrentQuestion)) {
          throw new InvalidAnswerError(
            currentQuestion.id,
            answerForCurrentQuestion.value,
          );
        }

        modifiedAnswers.push(answerForCurrentQuestion);
      }
    }

    application.answers = modifiedAnswers;
    await this._applications.save(application);
  }

  /**
   * @inheritdoc
   */
  public async getProfileForm(user: User): Promise<IForm> {
    const settings = await this._settings.getSettings();
    const application = await this.findOrCreateApplication(user);

    const questions = settings.application.profileForm.questions.filter(
      ({ createdAt }) =>
        application.initialProfileFormSubmittedAt == null ||
        createdAt.getTime() <=
          application.initialProfileFormSubmittedAt.getTime(),
    );

    const questionIDs = questions.map(({ id }) => id);
    const answers = application.answers.filter(({ question: { id } }) =>
      questionIDs.includes(id),
    );

    return {
      answers,
      questions,
    };
  }

  /**
   * @inheritdoc
   */
  public async storeProfileFormAnswers(
    user: User,
    answers: readonly IRawAnswer[],
  ): Promise<void> {
    const settings = await this._settings.getSettings();

    const now = Date.now();
    const isBeforeWindow =
      now < settings.application.allowProfileFormFrom.getTime();

    const isAfterWindow =
      settings.application.allowProfileFormUntil.getTime() < now;

    if (isBeforeWindow || isAfterWindow) {
      throw new FormNotAvailableError(
        settings.application.allowProfileFormFrom,
        settings.application.allowProfileFormUntil,
      );
    }

    const questions = settings.application.profileForm.questions;
    const application = await this.findOrCreateApplication(user);

    await this.replaceAnswers(application, questions, answers);

    if (application.initialProfileFormSubmittedAt == null) {
      application.initialProfileFormSubmittedAt = new Date();
      await this._applications.save(application);
    }
  }

  /**
   * @inheritdoc
   */
  public async admit(user: User): Promise<void> {
    const settings = await this._settings.getSettings();
    const application = await this.findExistingApplication(user);

    if (application == null) {
      throw new ProfileFormNotSubmittedError();
    }

    const now = Date.now();
    application.confirmationExpiresAt = new Date(
      now + settings.application.hoursToConfirm * 60 * 1000,
    );

    await this._applications.save(application);
  }

  /**
   * @inheritdoc
   */
  public async getConfirmationForm(user: User): Promise<IForm> {
    const settings = await this._settings.getSettings();
    const application = await this.findExistingApplication(user);

    if (application == null || application.confirmationExpiresAt == null) {
      throw new NotAdmittedError();
    }

    const skippedProfileQuestions = settings.application.profileForm.questions.filter(
      ({ createdAt }) =>
        createdAt.getTime() >
        application.initialProfileFormSubmittedAt!.getTime(),
    );

    try {
      // if the graph built correctly, then the skipped questions are a locally
      // connected subgraph of the profile form
      this._graph.buildQuestionGraph(skippedProfileQuestions);

      // in the future, we might allow conditional questions, but that requires
      // more work and isn't really worth it. we mostly need this feature to add
      // questions that were exempt during the initial process while, e.g., MLH
      // registration is pending and we need users to, e.g., consent to a CoC.
      // if people don't confirm their spot over this question, their place will
      // be freed anyways. therefore, something like a "if you're a student,
      // what's your major and minor" question can be implemented as a separate
      // two questions again checking the student situation. and in the end,
      // there are humans checking registrations anyways
    } catch (error) {
      throw new IncompleteProfileFormError();
    }

    const questions = [
      ...skippedProfileQuestions,
      ...settings.application.confirmationForm.questions,
    ];

    const questionIDs = questions.map(({ id }) => id);
    const answers = application.answers.filter(({ question: { id } }) =>
      questionIDs.includes(id),
    );

    return {
      answers,
      questions,
    };
  }

  /**
   * @inheritdoc
   */
  public async storeConfirmationFormAnswers(
    user: User,
    answers: readonly IRawAnswer[],
  ): Promise<void> {
    const application = await this.findExistingApplication(user);

    if (application == null || application.confirmationExpiresAt == null) {
      throw new NotAdmittedError();
    }

    const isAfterDeadline =
      application.confirmationExpiresAt.getTime() < Date.now();

    if (isAfterDeadline) {
      throw new ConfirmationDeadlineFailedError(
        application.confirmationExpiresAt,
      );
    }

    const { questions } = await this.getConfirmationForm(user);

    await this.replaceAnswers(application, questions, answers);

    if (!application.confirmed) {
      application.confirmed = true;
      await this._applications.save(application);
    }
  }
}

export class QuestionNotFoundError extends Error {
  constructor(questionID: number) {
    super(`Question '${questionID}' not found`);
  }
}

export class QuestionNotAnsweredError extends Error {
  constructor(questionID: number) {
    super(`Question '${questionID}' was not answered`);
  }
}

export class InvalidAnswerError extends Error {
  constructor(questionID: number, answer: string) {
    super(`Answer '${answer}' to question '${questionID}' is not valid`);
  }
}

export class FormNotAvailableError extends Error {
  constructor(from: Date, to: Date) {
    super(
      Date.now() < from.getTime()
        ? `This form is available from ${from.toISOString()}`
        : `This form is available until ${to.toISOString()}`,
    );
  }
}

export class QuestionGraphBrokenError extends Error {
  constructor() {
    super("The question graph is apparently broken. Nice");
  }
}

export class ProfileFormNotSubmittedError extends Error {
  constructor() {
    super("Profile form not submitted yet");
  }
}

export class NotAdmittedError extends Error {
  constructor() {
    super("Your application was not yet admitted. Be patient");
  }
}

export class IncompleteProfileFormError extends Error {
  constructor() {
    super("The profile form was incomplete");
  }
}

export class ConfirmationDeadlineFailedError extends Error {
  constructor(deadline: Date) {
    super(`Your confirmation deadline was on ${deadline.toISOString()}`);
  }
}
