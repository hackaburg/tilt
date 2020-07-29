import {
  Authorized,
  BadRequestError,
  Body,
  CurrentUser,
  Get,
  JsonController,
  NotAcceptableError,
  Post,
} from "routing-controllers";
import { Inject } from "typedi";
import { User } from "../entities/user";
import { UserRole } from "../entities/user-role";
import {
  ApplicationServiceToken,
  FormNotAvailableError,
  IApplicationService,
  InvalidAnswerError,
  IRawAnswer,
  QuestionNotAnsweredError,
  QuestionNotFoundError,
} from "../services/application-service";
import {
  AnswerDTO,
  convertBetweenEntityAndDTO,
  FormDTO,
  QuestionDTO,
  StoreAnswersRequestDTO,
} from "./dto";

@JsonController("/application")
export class ApplicationController {
  public constructor(
    @Inject(ApplicationServiceToken)
    private readonly _application: IApplicationService,
  ) {}

  /**
   * Gets the profile form for the given user.
   * @param user The currently logged in user
   */
  @Get("/profile")
  @Authorized(UserRole.User)
  public async getProfileForm(@CurrentUser() user: User): Promise<FormDTO> {
    const form = await this._application.getProfileForm(user);
    const dto = new FormDTO();

    dto.questions = form.questions.map((question) =>
      convertBetweenEntityAndDTO(question, QuestionDTO),
    );

    dto.answers = form.answers.map((answer) => {
      const answerDTO = new AnswerDTO();
      answerDTO.questionID = answer.questionID;
      answerDTO.value = answer.value;
      return answerDTO;
    });

    return dto;
  }

  /**
   * Stores the given answers for the current user.
   * @param user The currently logged in user
   */
  @Post("/profile/answers")
  @Authorized(UserRole.User)
  public async storeProfileFormAnswers(
    @CurrentUser() user: User,
    @Body() { data: answerDTOs }: StoreAnswersRequestDTO,
  ): Promise<void> {
    const answers = answerDTOs.map<IRawAnswer>((answerDTO) => ({
      questionID: answerDTO.questionID,
      value: answerDTO.value,
    }));

    try {
      await this._application.storeProfileFormAnswers(user, answers);
    } catch (error) {
      if (
        error instanceof QuestionNotFoundError ||
        error instanceof QuestionNotAnsweredError ||
        error instanceof InvalidAnswerError
      ) {
        throw new BadRequestError(error.message);
      } else if (error instanceof FormNotAvailableError) {
        throw new NotAcceptableError(error.message);
      }

      throw error;
    }
  }
}
