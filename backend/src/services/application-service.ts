import { Inject, Service, Token } from "typedi";
import { Repository } from "typeorm";
import { IService } from ".";
import { Answer } from "../entities/answer";
import { Application } from "../entities/application";
import { FormAnswers } from "../entities/form-answers";
import { Question } from "../entities/question";
import { QuestionType } from "../entities/question-type";
import { User } from "../entities/user";
import { enforceExhaustiveSwitch } from "../utils/switch";
import { DatabaseServiceToken, IDatabaseService } from "./database-service";
import {
  IQuestionGraphService,
  QuestionGraphServiceToken,
} from "./question-service";
import { ISettingsService, SettingsServiceToken } from "./settings-service";

/**
 * A form containing questions and given answers.
 */
export interface IForm {
  questions: readonly Question[];
  answers: readonly IRawAnswer[];
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
}

/**
 * A token used to inject a concrete application service.
 */
export const ApplicationServiceToken = new Token<IApplicationService>();

@Service(ApplicationServiceToken)
export class ApplicationService implements IApplicationService {
  private _formAnswers!: Repository<FormAnswers>;
  private _answers!: Repository<Answer>;
  private _applications!: Repository<Application>;

  constructor(
    @Inject(QuestionGraphServiceToken)
    private readonly _questions: IQuestionGraphService,
    @Inject(DatabaseServiceToken) private readonly _database: IDatabaseService,
    @Inject(SettingsServiceToken) private readonly _settings: ISettingsService,
  ) {}

  /**
   * @inheritdoc
   */
  public async bootstrap(): Promise<void> {
    this._formAnswers = this._database.getRepository(FormAnswers);
    this._answers = this._database.getRepository(Answer);
    this._applications = this._database.getRepository(Application);
  }

  /**
   * Returns whether the given question was answered correctly.
   * @param question The answered question
   * @param answer The answer to the answered question
   */
  private isAnswerValid(question: Question, answer: IRawAnswer): boolean {
    const configuration = question.configuration;

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

      application.profileFormAnswers = new FormAnswers();
      application.profileFormAnswers.answers = [];

      application.confirmationFormAnswers = new FormAnswers();
      application.confirmationFormAnswers.answers = [];

      return await this._applications.save(application);
    }

    return existingApplication;
  }

  /**
   * Replaces a user's answers to a given set of questions.
   * @param user The user to update the answers for
   * @param questions A set of questions the user should answer
   * @param nextAnswers The user's new answers for these questions
   */
  private async replaceAnswers(
    form: FormAnswers,
    questions: readonly Question[],
    nextAnswers: readonly IRawAnswer[],
  ) {
    const questionGraph = this._questions.buildQuestionGraph(questions);
    const startNodes = [...questionGraph.values()].filter(
      ({ parentNode }) => parentNode == null,
    );

    const answers = [] as Answer[];

    for (const node of startNodes) {
      let nodesToVisit = [node];

      while (nodesToVisit.length > 0) {
        const [currentNode, ...rest] = nodesToVisit;
        nodesToVisit = [...rest, ...currentNode.childNodes];

        const currentQuestion = currentNode.question;
        const answerForCurrentQuestion = nextAnswers.find(
          ({ questionID }) => questionID === currentQuestion.id,
        );

        if (!answerForCurrentQuestion) {
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
          const parentAnswer = nextAnswers.find(
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

        const answer = new Answer();
        answer.question = currentQuestion;
        answer.value = answerForCurrentQuestion.value;
        answers.push(answer);
      }
    }

    if (form.answers.length > 0) {
      await this._answers.remove(form.answers);
    }

    form.answers = answers;
    await this._formAnswers.save(form);
  }

  /**
   * @inheritdoc
   */
  public async getProfileForm(user: User): Promise<IForm> {
    const settings = await this._settings.getSettings();
    const application = await this.findOrCreateApplication(user);

    return {
      answers: application.profileFormAnswers.answers.map((answer) => ({
        questionID: answer.question.id,
        value: answer.value,
      })),
      questions: settings.application.profileForm.questions,
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

    await this.replaceAnswers(
      application.profileFormAnswers,
      questions,
      answers,
    );
  }

  /**
   * @inheritdoc
   */
  public async getConfirmationQuestionsForUser(
    user: User,
  ): Promise<readonly Question[]> {
    const settings = await this._settings.getSettings();
    const application = await this.findExistingApplication(user);

    if (application == null) {
      return [];
    }

    const skippedProfileQuestions = settings.application.profileForm.questions.filter(
      ({ createdAt }) => createdAt.getTime() > application.updatedAt.getTime(),
    );

    return [
      ...skippedProfileQuestions,
      ...settings.application.confirmationForm.questions,
    ];
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
