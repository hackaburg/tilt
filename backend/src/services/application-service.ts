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
  QuestionGraphServiceToken,
} from "./question-service";
import { ISettingsService, SettingsServiceToken } from "./settings-service";

/**
 * A service to handle applications.
 */
export interface IApplicationService extends IService {
  /**
   * Stores a user's answers to the profile questions.
   * @param user A user whose answers to store
   * @param answers The answers to store
   */
  storeProfileAnswersForUser(
    user: User,
    answers: readonly Answer[],
  ): Promise<void>;
}

/**
 * A token used to inject a concrete application service.
 */
export const ApplicationServiceToken = new Token<IApplicationService>();

@Service(ApplicationServiceToken)
export class ApplicationService implements IApplicationService {
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
    this._answers = this._database.getRepository(Answer);
    this._applications = this._database.getRepository(Application);
  }

  /**
   * Returns whether the given question was answered correctly.
   * @param question The answered question
   * @param answer The answer to the answered question
   */
  private isAnswerValid(question: Question, answer: Answer): boolean {
    const configuration = question.configuration;

    switch (configuration.type) {
      case QuestionType.Choices:
        return configuration.choices.includes(answer.value);

      case QuestionType.Country:
      case QuestionType.Text:
        return true;

      case QuestionType.Number:
        const numberValue = Number(answer.value);
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

      return await this._applications.save(application);
    }

    return existingApplication;
  }

  /**
   * Replaces a user's answers to a given set of questions.
   * @param user The user to update the answers for
   * @param questions A set of questions the user should answer
   * @param previousAnswers The user's old answers to these questions
   * @param nextAnswers The user's new answers for these questions
   */
  private async replaceAnswers(
    user: User,
    questions: readonly Question[],
    previousAnswers: Answer[],
    nextAnswers: readonly Answer[],
  ) {
    const questionGraph = this._questions.buildQuestionGraph(questions);
    const answers = nextAnswers.map((rawAnswer) => {
      const answer = new Answer();
      answer.user = user;
      answer.value = rawAnswer.value;

      const node = questionGraph.get(rawAnswer.question.id);

      if (!node) {
        throw new QuestionNotFoundError(rawAnswer.question.id);
      }

      answer.question = node.question;

      const isValid = this.isAnswerValid(node.question, answer);

      if (!isValid) {
        throw new InvalidAnswerError(rawAnswer.question.id, answer.value);
      }

      return answer;
    });

    // todo: validate here

    await this._answers.remove(previousAnswers);
    await this._answers.save(answers);
  }

  /**
   * @inheritdoc
   */
  public async storeProfileAnswersForUser(
    user: User,
    answers: readonly Answer[],
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
      user,
      questions,
      application.profileAnswers,
      answers,
    );
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
    super(`Answer '${answer}' to question '${questionID} is not valid`);
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
