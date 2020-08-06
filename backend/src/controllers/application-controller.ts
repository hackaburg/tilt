import {
  Authorized,
  BadRequestError,
  Body,
  CurrentUser,
  Delete,
  Get,
  JsonController,
  NotAcceptableError,
  NotFoundError,
  Post,
  Put,
} from "routing-controllers";
import { Inject } from "typedi";
import { User } from "../entities/user";
import { UserRole } from "../entities/user-role";
import {
  ApplicationServiceToken,
  FormNotAvailableError,
  IApplicationService,
  IForm,
  IncompleteProfileFormError,
  InvalidAnswerError,
  IRawAnswer,
  NotAdmittedError,
  ProfileFormNotSubmittedError,
  QuestionNotAnsweredError,
  QuestionNotFoundError,
} from "../services/application-service";
import { IUserService, UserServiceToken } from "../services/user-service";
import {
  AnswerDTO,
  ApplicationDTO,
  convertBetweenEntityAndDTO,
  FormDTO,
  IDsRequestDTO,
  QuestionDTO,
  StoreAnswersRequestDTO,
} from "./dto";

@JsonController("/application")
export class ApplicationController {
  public constructor(
    @Inject(ApplicationServiceToken)
    private readonly _application: IApplicationService,
    @Inject(UserServiceToken)
    private readonly _users: IUserService,
  ) {}

  /**
   * Converts a form from the internal representation to DTO.
   * @param form A form received from the `IApplicationService`
   */
  private convertFormToDTO(form: IForm): FormDTO {
    const dto = new FormDTO();

    dto.questions = form.questions.map((question) =>
      convertBetweenEntityAndDTO(question, QuestionDTO),
    );

    dto.answers = form.answers.map((answer) =>
      convertBetweenEntityAndDTO(answer, AnswerDTO),
    );

    return dto;
  }

  /**
   * Converts request answers to raw answers for the service.
   * @param answerDTOs The answers from the request
   */
  private convertAnswerDTOsToRawAnswers(
    answerDTOs: readonly AnswerDTO[],
  ): readonly IRawAnswer[] {
    return answerDTOs.map<IRawAnswer>(({ questionID, value }) => ({
      questionID,
      value,
    }));
  }

  /**
   * Wraps a service error to an HTTP error.
   * @param error The error received from the service
   */
  private convertErrorToHTTP(error: Error): Error {
    if (error instanceof QuestionNotFoundError) {
      return new NotFoundError(error.message);
    } else if (
      error instanceof IncompleteProfileFormError ||
      error instanceof InvalidAnswerError ||
      error instanceof NotAdmittedError ||
      error instanceof ProfileFormNotSubmittedError ||
      error instanceof QuestionNotAnsweredError ||
      error instanceof QuestionNotFoundError
    ) {
      return new BadRequestError(error.message);
    } else if (error instanceof FormNotAvailableError) {
      return new NotAcceptableError(error.message);
    }

    return error;
  }

  /**
   * Gets the profile form for the given user.
   * @param user The currently logged in user
   */
  @Get("/profile")
  @Authorized(UserRole.User)
  public async getProfileForm(@CurrentUser() user: User): Promise<FormDTO> {
    const form = await this._application.getProfileForm(user);
    return this.convertFormToDTO(form);
  }

  /**
   * Stores the given answers for the current user.
   * @param user The currently logged in user
   */
  @Post("/profile")
  @Authorized(UserRole.User)
  public async storeProfileFormAnswers(
    @Body() { data: answerDTOs }: StoreAnswersRequestDTO,
    @CurrentUser() user: User,
  ): Promise<void> {
    const answers = this.convertAnswerDTOsToRawAnswers(answerDTOs);

    try {
      await this._application.storeProfileFormAnswers(user, answers);
    } catch (error) {
      throw this.convertErrorToHTTP(error);
    }
  }

  /**
   * Admits a list of users.
   */
  @Put("/admit")
  @Authorized(UserRole.Moderator)
  public async admit(@Body() { data: userIDs }: IDsRequestDTO): Promise<void> {
    const users = await this._users.findUsersByIDs(userIDs);
    const firstMissingIndex = users.findIndex((user) => user == null);

    if (firstMissingIndex !== -1) {
      throw new NotFoundError(
        `no user with id ${userIDs[firstMissingIndex]} found`,
      );
    }

    try {
      await this._application.admit(users as readonly User[]);
    } catch (error) {
      throw this.convertErrorToHTTP(error);
    }
  }

  /**
   * Gets the confirmation form with all not yet answered questions from the
   * profile form.
   * @param user The currently logged in user
   */
  @Get("/confirm")
  @Authorized(UserRole.User)
  public async getConfirmationForm(
    @CurrentUser() user: User,
  ): Promise<FormDTO> {
    try {
      const form = await this._application.getConfirmationForm(user);
      return this.convertFormToDTO(form);
    } catch (error) {
      throw this.convertErrorToHTTP(error);
    }
  }

  /**
   * Stores the answers to the confirmation form.
   * @param user The currently logged in user
   */
  @Post("/confirm")
  @Authorized(UserRole.User)
  public async storeConfirmationFormAnswers(
    @Body() { data: answerDTOs }: StoreAnswersRequestDTO,
    @CurrentUser() user: User,
  ): Promise<void> {
    const answers = this.convertAnswerDTOsToRawAnswers(answerDTOs);

    try {
      await this._application.storeConfirmationFormAnswers(user, answers);
    } catch (error) {
      throw this.convertErrorToHTTP(error);
    }
  }

  /**
   * Declines the spot of the current user.
   * @param user The currently logged in user
   */
  @Delete("/confirm")
  @Authorized(UserRole.User)
  public async declineSpot(@CurrentUser() user: User) {
    await this._application.declineSpot(user);
  }

  /**
   * Gets all existing application. This only includes applications where users
   * actually applied.
   */
  @Get("/all")
  @Authorized(UserRole.Moderator)
  public async getAllApplications(): Promise<readonly ApplicationDTO[]> {
    const applications = await this._application.getAll();
    return applications.map((application) =>
      convertBetweenEntityAndDTO(application, ApplicationDTO),
    );
  }
}
