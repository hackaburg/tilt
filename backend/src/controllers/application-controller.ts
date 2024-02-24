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
  Param,
  Post,
  Put,
} from "routing-controllers";
import { Inject } from "typedi";
import { User } from "../entities/user";
import { UserRole } from "../entities/user-role";
import {
  AlreadyAdmittedError,
  AlreadyDeclinedError,
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
  IDRequestDTO,
  IDsRequestDTO,
  QuestionDTO,
  StoreAnswersRequestDTO,
  SuccessResponseDTO,
  TeamDTO,
  TeamRequestDTO,
  TeamResponseDTO,
  TeamUpdateDTO,
} from "./dto";
import { ITeamService, TeamServiceToken } from "../services/team-service";
import { Team } from "../entities/team";

@JsonController("/application")
export class ApplicationController {
  public constructor(
    @Inject(ApplicationServiceToken)
    private readonly _application: IApplicationService,
    @Inject(UserServiceToken)
    private readonly _users: IUserService,
    @Inject(TeamServiceToken)
    private readonly _teams: ITeamService,
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
  private convertErrorToHTTP(error: unknown): Error {
    if (error instanceof QuestionNotFoundError) {
      return new NotFoundError(error.message);
    } else if (
      error instanceof AlreadyAdmittedError ||
      error instanceof AlreadyDeclinedError ||
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

    return new Error(String(error));
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

  /**
   * Checks in the given user.
   */
  @Put("/checkin")
  @Authorized(UserRole.Moderator)
  public async checkIn(@Body() { data: userID }: IDRequestDTO): Promise<void> {
    const [user] = await this._users.findUsersByIDs([userID]);

    if (user == null) {
      throw new NotFoundError(`no user with id ${userID}`);
    }

    await this._application.checkIn(user);
  }

  /**
   * Gets all existing teams.
   */
  @Get("/team")
  @Authorized(UserRole.User)
  public async getAllTeams(): Promise<readonly TeamDTO[]> {
    const teams = await this._teams.getAllTeams();
    return teams.map((team) => convertBetweenEntityAndDTO(team, TeamDTO));
  }

  /**
   * Creates a team.
   */
  @Post("/team")
  @Authorized(UserRole.User)
  public async createTeam(
    @Body() { data: teamDTO }: { data: TeamRequestDTO },
  ): Promise<TeamDTO> {
    const team = convertBetweenEntityAndDTO(teamDTO, Team);
    const createdTeam = await this._teams.createTeam(team);
    return convertBetweenEntityAndDTO(createdTeam, TeamDTO);
  }

  /**
   * Update a team.
   */
  @Put("/team")
  @Authorized(UserRole.User)
  public async updateTeam(
    @Body() { data: teamDTO }: { data: TeamUpdateDTO },
  ): Promise<TeamDTO> {
    const team = convertBetweenEntityAndDTO(teamDTO, Team);
    const updateTeam = await this._teams.updateTeam(team);
    return convertBetweenEntityAndDTO(updateTeam, TeamDTO);
  }

  /**
   * Request to join a team.
   * @param teamId The id of the team
   */
  @Post("/team/:id/request")
  @Authorized(UserRole.User)
  public async requestToJoinTeam(
    @Param("id") teamId: number,
    @CurrentUser() user: User,
  ): Promise<SuccessResponseDTO> {
    await this._teams.requestToJoinTeam(teamId, user);
    const response = new SuccessResponseDTO();
    response.success = true;
    return response;
  }

  /**
   * Accept a user to a team.
   * @param teamId The id of the team
   * @param userId The id of the user
   */
  @Put("/team/:teamId/accept/:userId")
  @Authorized(UserRole.User)
  public async acceptUserToTeam(
    @Param("teamId") teamId: number,
    @Param("userId") userId: number,
    @CurrentUser() user: User,
  ): Promise<SuccessResponseDTO> {
    await this._teams.acceptUserToTeam(teamId, userId, user);
    const response = new SuccessResponseDTO();
    response.success = true;
    return response;
  }

  /**
   * Get team by id.
   * @param id The id of the team
   */
  @Get("/team/:id")
  @Authorized(UserRole.User)
  public async getTeamByID(
    @Param("id") teamId: number,
    @CurrentUser() user: User,
  ): Promise<TeamResponseDTO> {
    const team = await this._teams.getTeamByID(teamId, user.id);

    if (team == null) {
      throw new NotFoundError(`no team with id ${teamId}`);
    }

    return team;
  }

  /**
   * Delete a team by id
   * @param id The id of the team
   */
  @Delete("/team/:id")
  @Authorized(UserRole.User)
  public async deleteTeamByID(
    @Param("id") teamId: number,
    @CurrentUser() user: User,
  ): Promise<SuccessResponseDTO> {
    await this._teams.deleteTeamByID(teamId, user);
    const response = new SuccessResponseDTO();
    response.success = true;
    return response;
  }
}
