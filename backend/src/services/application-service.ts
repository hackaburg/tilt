import { Inject, Service, Token } from "typedi";
import { Repository } from "typeorm";
import { IService } from ".";
import { Answer } from "../entities/answer";
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
import { IUserService, UserServiceToken } from "./user-service";

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
 * An application for a user and their answers.
 */
export interface IApplication {
  user: User;
  answers: readonly Answer[];
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
   * Admits the given users.
   * @param users The users to admit
   */
  admit(users: readonly User[]): Promise<void>;

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

  /**
   * Gets all existing applications.
   */
  getAll(): Promise<readonly IApplication[]>;

  /**
   * Delete a user's answers.
   * @param user The user whose answers to delete
   */
  deleteAnswers(user: User): Promise<void>;
}

/**
 * A token used to inject a concrete application service.
 */
export const ApplicationServiceToken = new Token<IApplicationService>();

@Service(ApplicationServiceToken)
export class ApplicationService implements IApplicationService {
  private _answers!: Repository<Answer>;

  constructor(
    @Inject(QuestionGraphServiceToken)
    private readonly _graph: IQuestionGraphService,
    @Inject(DatabaseServiceToken) private readonly _database: IDatabaseService,
    @Inject(SettingsServiceToken) private readonly _settings: ISettingsService,
    @Inject(UserServiceToken) private readonly _users: IUserService,
  ) {}

  /**
   * @inheritdoc
   */
  public async bootstrap(): Promise<void> {
    this._answers = this._database.getRepository(Answer);
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
   * Resolves the given raw answers from the user to either existing @see Answer
   * entities or creates fresh ones.
   * @param user The user giving the answers
   * @param existingAnswers The user's already given answers
   * @param questionGraph The question graph for the user's current form
   * @param rawAnswers The answers provided by the user
   */
  private resolveAnswersToEntities(
    user: User,
    existingAnswers: readonly Answer[],
    questionGraph: QuestionGraph,
    rawAnswers: readonly IRawAnswer[],
  ): readonly Answer[] {
    return rawAnswers.map((rawAnswer) => {
      const existingAnswer = existingAnswers.find(
        ({ question: { id } }) => rawAnswer.questionID === id,
      );

      if (existingAnswer) {
        existingAnswer.value = rawAnswer.value;
        return existingAnswer;
      }

      const answer = new Answer();
      answer.value = rawAnswer.value;
      answer.user = user;

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
   * @param user The user giving the answers
   * @param questions A set of questions the user should answer
   * @param givenAnswers The user's new answers for these questions
   */
  private async replaceAnswers(
    user: User,
    questions: readonly Question[],
    givenAnswers: readonly IRawAnswer[],
  ) {
    const questionGraph = this._graph.buildQuestionGraph(questions);
    const startNodes = [...questionGraph.values()].filter(
      ({ parentNode }) => parentNode == null,
    );

    const existingAnswers = await this.findAllExistingAnswers(user);
    const answers = this.resolveAnswersToEntities(
      user,
      existingAnswers,
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
            throw new QuestionNotAnsweredError(
              currentQuestion.title,
              currentQuestion.id,
            );
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
            throw new QuestionNotAnsweredError(
              currentQuestion.title,
              currentQuestion.id,
            );
          }

          // the question might be mandatory, but we didn't show it to the user
          // in the first place, therefore we can ignore it
          continue;
        }

        if (!this.isAnswerValid(currentQuestion, answerForCurrentQuestion)) {
          throw new InvalidAnswerError(
            currentQuestion.title,
            currentQuestion.id,
            answerForCurrentQuestion.value,
          );
        }

        modifiedAnswers.push(answerForCurrentQuestion);
      }
    }

    await this._answers.save(modifiedAnswers);
  }

  /**
   * Finds all answers for the given user.
   * @param user A user whose answers we want to get
   */
  private async findAllExistingAnswers(user: User): Promise<Answer[]> {
    return await this._answers.find({
      user: {
        id: user.id,
      },
    });
  }

  /**
   * @inheritdoc
   */
  public async getProfileForm(user: User): Promise<IForm> {
    const settings = await this._settings.getSettings();

    const questions = settings.application.profileForm.questions.filter(
      ({ createdAt }) =>
        user.initialProfileFormSubmittedAt == null ||
        createdAt.getTime() <= user.initialProfileFormSubmittedAt.getTime(),
    );

    const questionIDs = questions.map(({ id }) => id);
    const allAnswers = await this.findAllExistingAnswers(user);
    const answers = allAnswers.filter(({ question: { id } }) =>
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

    await this.replaceAnswers(user, questions, answers);

    if (user.initialProfileFormSubmittedAt == null) {
      user.initialProfileFormSubmittedAt = new Date();
      await this._users.updateUser(user);
    }
  }

  /**
   * @inheritdoc
   */
  public async admit(users: readonly User[]): Promise<void> {
    const settings = await this._settings.getSettings();
    const now = Date.now();

    for (const user of users) {
      user.confirmationExpiresAt = new Date(
        now + settings.application.hoursToConfirm * 60 * 1000,
      );

      user.admitted = true;
    }

    await this._users.updateUsers(users);
  }

  /**
   * @inheritdoc
   */
  public async getConfirmationForm(user: User): Promise<IForm> {
    const settings = await this._settings.getSettings();

    if (user.confirmationExpiresAt == null) {
      throw new NotAdmittedError();
    }

    const skippedProfileQuestions = settings.application.profileForm.questions.filter(
      ({ createdAt }) =>
        createdAt.getTime() > user.initialProfileFormSubmittedAt!.getTime(),
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
    const allAnswers = await this.findAllExistingAnswers(user);
    const answers = allAnswers.filter(({ question: { id } }) =>
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
    if (user.confirmationExpiresAt == null) {
      throw new NotAdmittedError();
    }

    const isAfterDeadline = user.confirmationExpiresAt.getTime() < Date.now();

    if (isAfterDeadline) {
      throw new ConfirmationDeadlineFailedError(user.confirmationExpiresAt);
    }

    const { questions } = await this.getConfirmationForm(user);

    await this.replaceAnswers(user, questions, answers);

    if (!user.confirmed) {
      user.confirmed = true;
      await this._users.updateUser(user);
    }
  }

  /**
   * @inheritdoc
   */
  public async getAll(): Promise<readonly IApplication[]> {
    const allAnswers = await this._answers.find();
    const allUsers = await this._users.findAll();

    const answersByUserID = new Map<User["id"], Answer[]>();

    for (const answer of allAnswers) {
      const answers = answersByUserID.get(answer.user.id) ?? [];
      answers.push(answer);
      answersByUserID.set(answer.user.id, answers);
    }

    const applications = allUsers.map<IApplication>((user) => ({
      answers: answersByUserID.get(user.id) ?? [],
      user,
    }));

    applications.sort(
      (a, b) => a.user.createdAt.getTime() - b.user.createdAt.getTime(),
    );

    return applications;
  }

  /**
   * @inheritdoc
   */
  public async deleteAnswers(user: User): Promise<void> {
    await this._answers.delete({
      user: {
        id: user.id,
      },
    });
  }
}

export class QuestionNotFoundError extends Error {
  constructor(questionID: number) {
    super(`Question '${questionID}' not found`);
  }
}

export class QuestionNotAnsweredError extends Error {
  constructor(questionTitle: string, questionID: number) {
    super(`Question '${questionTitle}' (#${questionID}) was not answered`);
  }
}

export class InvalidAnswerError extends Error {
  constructor(questionTitle: string, questionID: number, answer: string) {
    super(
      `Answer '${answer}' to question '${questionTitle}' (#${questionID}) is not valid`,
    );
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
