import { Inject, Service, Token } from "typedi";
import { Repository } from "typeorm";
import { IService } from ".";
import { Answer } from "../entities/answer";
import { Question } from "../entities/question";
import { User } from "../entities/user";
import { DatabaseServiceToken, IDatabaseService } from "./database-service";

/**
 * A service to support users answering questions.
 */
export interface IAnswerService extends IService {
  /**
   * Gets all answers given by an individual user.
   * @param user A user whose answers to get
   */
  getAnswersForUser(user: User): Promise<readonly Answer[]>;

  /**
   * Stores the given answers for the given user.
   * @param user A user whose answers to store
   * @param answers The raw answers to store
   */
  storeAnswers(
    user: User,
    answers: readonly Answer[],
    questions: readonly Question[],
  ): Promise<readonly Answer[]>;
}

/**
 * A token used to inject a concrete answer service.
 */
export const AnswerServiceToken = new Token<IAnswerService>();

@Service(AnswerServiceToken)
export class AnswerService implements IAnswerService {
  private _answers!: Repository<Answer>;

  constructor(
    @Inject(DatabaseServiceToken) private readonly _database: IDatabaseService,
  ) {}

  /**
   * @inheritdoc
   */
  public async bootstrap(): Promise<void> {
    this._answers = this._database.getRepository(Answer);
  }

  /**
   * @inheritdoc
   */
  public async getAnswersForUser(user: User): Promise<readonly Answer[]> {
    return await this._answers.find({
      where: {
        user: {
          id: user.id,
        },
      },
    });
  }

  /**
   * @inheritdoc
   */
  public async storeAnswers(
    user: User,
    answers: readonly Answer[],
    questions: readonly Question[],
  ): Promise<readonly Answer[]> {
    const entities = answers.map((answer) => {
      const entity = new Answer();
      entity.user = user;
      entity.value = answer.value;

      const question = questions.find(({ id }) => answer.question.id === id);

      if (question == null) {
        throw new QuestionNotFoundError(answer.question.id);
      }

      entity.question = question;

      return entity;
    });

    return entities;
  }
}

export class QuestionNotFoundError extends Error {
  constructor(questionID: number) {
    super(`No such question '${questionID}'`);
  }
}
