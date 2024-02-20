import { Expose, plainToClass, Transform, Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEmail,
  IsHexColor,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
  ValidateNested,
} from "class-validator";
import { Answer } from "../entities/answer";
import { ApplicationSettings } from "../entities/application-settings";
import { FormSettings } from "../entities/form-settings";
import {
  IChoicesQuestionConfiguration,
  ICountryQuestionConfiguration,
  INumberQuestionConfiguration,
  IQuestionConfiguration,
  ITextQuestionConfiguration,
  Question,
} from "../entities/question";
import { QuestionType } from "../entities/question-type";
import {
  EmailSettings,
  EmailTemplate,
  EmailTemplateSize,
  FrontendSettings,
  Settings,
} from "../entities/settings";
import { User } from "../entities/user";
import { UserRole } from "../entities/user-role";
import { IForm, IRawAnswer } from "../services/application-service";
import { enforceExhaustiveSwitch } from "../utils/switch";
import { IApiRequest } from "./api";

type NativeType = string | number | boolean;
type DTO<TEntity> = {
  [K in keyof Omit<TEntity, "id">]: TEntity[K] extends NativeType
    ? TEntity[K]
    : any;
};

type ClassDeclaration<T> = new (...args: any[]) => T;

/**
 * Converts a given entity to a DTO and vice versa.
 * @param input An object to convert
 * @param outputClass The desired class
 */
export const convertBetweenEntityAndDTO = <TOutput>(
  input: any,
  outputClass: ClassDeclaration<TOutput>,
): TOutput => plainToClass(outputClass, [input])[0];

export class SettingsDTO implements DTO<Omit<Settings, "updatedAt">> {
  @Type(() => ApplicationSettingsDTO)
  @ValidateNested()
  @Expose()
  public application!: ApplicationSettingsDTO;
  @Type(() => FrontendSettingsDTO)
  @ValidateNested()
  @Expose()
  public frontend!: FrontendSettingsDTO;
  @Type(() => EmailSettingsDTO)
  @ValidateNested()
  @Expose()
  public email!: EmailSettingsDTO;
}

export class ApplicationSettingsDTO implements DTO<ApplicationSettings> {
  @Type(() => FormSettingsDTO)
  @ValidateNested()
  @Expose()
  public profileForm!: FormSettingsDTO;
  @Type(() => FormSettingsDTO)
  @ValidateNested()
  @Expose()
  public confirmationForm!: FormSettingsDTO;
  @Type(() => Date)
  @IsDate()
  @Expose()
  public allowProfileFormFrom!: Date;
  @Type(() => Date)
  @IsDate()
  @Expose()
  public allowProfileFormUntil!: Date;
  @IsNumber()
  @Expose()
  public hoursToConfirm!: number;
}

export class FormSettingsDTO implements DTO<FormSettings> {
  @IsString()
  @Expose()
  public title!: string;
  @IsArray()
  @Type(() => QuestionDTO)
  @ValidateNested({ each: true })
  @Expose()
  public questions!: QuestionDTO[];
}

export abstract class QuestionConfigurationDTOBase {
  @Expose()
  public type!: QuestionType;
}

export class TextQuestionConfigurationDTO
  implements ITextQuestionConfiguration
{
  @Expose()
  public type!: QuestionType.Text;
  @IsString()
  @Expose()
  public placeholder!: string;
  @IsBoolean()
  @Expose()
  public multiline!: boolean;
  @IsBoolean()
  @Expose()
  public convertAnswerToUrl!: boolean;
}

export class NumberQuestionConfigurationDTO
  implements INumberQuestionConfiguration
{
  @Expose()
  public type!: QuestionType.Number;
  @IsString()
  @Expose()
  public placeholder!: string;
  @IsOptional()
  @IsNumber()
  @Expose()
  public minValue?: number;
  @IsOptional()
  @IsNumber()
  @Expose()
  public maxValue?: number;
  @IsBoolean()
  @Expose()
  public allowDecimals!: boolean;
}

export class ChoicesQuestionConfigurationDTO
  implements IChoicesQuestionConfiguration
{
  @Expose()
  public type!: QuestionType.Choices;
  @IsArray()
  @Expose()
  public choices!: string[];
  @IsBoolean()
  @Expose()
  public allowMultiple!: boolean;
  @IsBoolean()
  @Expose()
  public displayAsDropdown!: boolean;
}

export class CountryQuestionConfigurationDTO
  implements ICountryQuestionConfiguration
{
  @Expose()
  public type!: QuestionType.Country;
}

export class QuestionDTO<TQuestionConfigurationDTO = IQuestionConfiguration>
  implements DTO<Omit<Question, "form" | "parent" | "createdAt" | "order">>
{
  @IsOptional()
  @IsInt()
  @Expose()
  public id!: number | null;
  @Transform(
    ({ value: rawValue }) => {
      const value = rawValue as IQuestionConfiguration;
      const type = value.type as QuestionType;

      switch (type) {
        case QuestionType.Text:
          return convertBetweenEntityAndDTO(
            value,
            TextQuestionConfigurationDTO,
          );

        case QuestionType.Number:
          return convertBetweenEntityAndDTO(
            value,
            NumberQuestionConfigurationDTO,
          );

        case QuestionType.Choices:
          return convertBetweenEntityAndDTO(
            value,
            ChoicesQuestionConfigurationDTO,
          );

        case QuestionType.Country:
          return convertBetweenEntityAndDTO(
            value,
            CountryQuestionConfigurationDTO,
          );

        default:
          enforceExhaustiveSwitch(type);
          return value;
      }
    },
    { toClassOnly: true },
  )
  @Expose()
  public configuration!: TQuestionConfigurationDTO;
  @IsString()
  @Expose()
  public description!: string;
  @IsString()
  @Expose()
  public title!: string;
  @IsBoolean()
  @Expose()
  public mandatory!: boolean;
  @IsOptional()
  @Expose()
  public parentID!: number | null;
  @IsOptional()
  @IsString()
  @Expose()
  public showIfParentHasValue!: string | null;
}

export class FrontendSettingsDTO implements DTO<FrontendSettings> {
  @IsHexColor()
  @Expose()
  public colorGradientStart!: string;
  @IsHexColor()
  @Expose()
  public colorGradientEnd!: string;
  @IsHexColor()
  @Expose()
  public colorLink!: string;
  @IsHexColor()
  @Expose()
  public colorLinkHover!: string;
  @IsUrl()
  @Expose()
  public loginSignupImage!: string;
  @IsUrl()
  @Expose()
  public sidebarImage!: string;
}

export class EmailSettingsDTO implements DTO<EmailSettings> {
  @IsString()
  @Expose()
  public sender!: string;
  @Type(() => EmailTemplateDTO)
  @ValidateNested()
  @Expose()
  public verifyEmail!: EmailTemplateDTO;
  @Type(() => EmailTemplateDTO)
  @ValidateNested()
  @Expose()
  public forgotPasswordEmail!: EmailTemplateDTO;
  @Type(() => EmailTemplateDTO)
  @ValidateNested()
  @Expose()
  public admittedEmail!: EmailTemplateDTO;
}

export class EmailTemplateDTO implements DTO<EmailTemplate> {
  @IsString()
  @Expose()
  public subject!: string;
  @IsString()
  @Expose()
  @MaxLength(EmailTemplateSize)
  public htmlTemplate!: string;
  @IsString()
  @Expose()
  @MaxLength(EmailTemplateSize)
  public textTemplate!: string;
}

export class UpdateSettingsRequestDTO implements IApiRequest<SettingsDTO> {
  @Type(() => SettingsDTO)
  @ValidateNested()
  @Expose()
  public data!: SettingsDTO;
}

export class LoginCredentialsDTO {
  @IsEmail()
  public email!: string;
  @IsString()
  @MinLength(6)
  public password!: string;
}

export class CredentialsDTO {
  @IsString()
  @MinLength(3)
  public firstName!: string;
  @IsString()
  @MinLength(3)
  public lastName!: string;
  @IsEmail()
  public email!: string;
  @IsString()
  @MinLength(6)
  public password!: string;
}

export class PasswordResetDTO {
  @IsString()
  @MinLength(6)
  public password!: string;
  @IsString()
  public token!: string;
}

export class CredentialsRequestDTO implements IApiRequest<CredentialsDTO> {
  @Type(() => CredentialsDTO)
  @ValidateNested()
  public data!: CredentialsDTO;
}

export class LoginCredentialsRequestDTO
  implements IApiRequest<LoginCredentialsDTO>
{
  @Type(() => LoginCredentialsDTO)
  @ValidateNested()
  public data!: LoginCredentialsDTO;
}

export class PasswordResetRequestDTO implements IApiRequest<PasswordResetDTO> {
  @Type(() => PasswordResetDTO)
  @ValidateNested()
  public data!: PasswordResetDTO;
}

export class ForgotPasswordRequestDTO
  implements IApiRequest<ForgotPasswordDTO>
{
  @Type(() => ForgotPasswordDTO)
  @ValidateNested()
  public data!: ForgotPasswordDTO;
}

export class ForgotPasswordDTO {
  @Expose()
  public email!: string;
}

export class SignupResponseDTO {
  @Expose()
  public email!: string;
}

export class ForgotPasswordResponseDTO {
  @Expose()
  public message!: string;
}

export class SuccessResponseDTO {
  @Expose()
  public success!: boolean;
}

export class UserDetailsRepsonseDTO {
  @Expose()
  public firstName!: string;
  @Expose()
  public lastName!: string;
  @Expose()
  public email!: string;
  @Expose()
  public role!: UserRole;
}

export class UserTokenResponseDTO {
  @Expose()
  public token!: string;
  @Expose()
  public user!: UserDTO;
}

export class FormDTO implements DTO<IForm> {
  @Expose()
  public questions!: readonly QuestionDTO[];
  @Expose()
  public answers!: readonly AnswerDTO[];
}

export class AnswerDTO {
  @IsInt()
  @Expose()
  @Transform(
    ({ obj: rawObj }) => {
      const obj = rawObj as IRawAnswer | Answer;

      if (obj instanceof Answer) {
        if (obj.question !== null) {
          return obj.question.id;
        } else {
          return null;
        }
      }

      return obj.questionID;
    },
    { toClassOnly: true },
  )
  public questionID!: number;
  @IsString()
  @Expose()
  public value!: string;
}

export class StoreAnswersRequestDTO
  implements IApiRequest<readonly AnswerDTO[]>
{
  @ValidateNested({ each: true })
  @Type(() => AnswerDTO)
  public data!: readonly AnswerDTO[];
}

export class UserDTO {
  @Expose()
  public id!: number;
  @Expose()
  public email!: string;
  @Expose()
  public firstName!: string;
  @Expose()
  public lastName!: string;
  @Expose()
  public createdAt!: Date;
  @Transform(
    ({ obj: rawObj }) => {
      const obj = rawObj as User;
      return !obj.verifyToken;
    },
    { toClassOnly: true },
  )
  @Expose()
  public isVerified!: boolean;
  @Expose()
  public role!: UserRole;
  @Expose()
  public initialProfileFormSubmittedAt!: Date | null;
  @Expose()
  public confirmationExpiresAt!: Date | null;
  @Expose()
  public admitted!: boolean;
  @Expose()
  public confirmed!: boolean;
  @Expose()
  public declined!: boolean;
  @Expose()
  public checkedIn!: boolean;
}

export class UserListDto {
  @Expose()
  public id!: number;
  @Expose()
  public name!: string;
}

export class ApplicationDTO {
  @Expose()
  @Type(() => UserDTO)
  public user!: UserDTO;
  @Expose()
  @Type(() => AnswerDTO)
  public answers!: AnswerDTO[];
}

export class IDsRequestDTO implements IApiRequest<readonly number[]> {
  @IsInt({ each: true })
  public data!: readonly number[];
}

export class IDRequestDTO implements IApiRequest<number> {
  @IsInt()
  public data!: number;
}

export class TeamDTO {
  @Expose()
  public id!: number;
  @Expose()
  public title!: string;
  @Expose()
  public users?: string[];
  @Expose()
  public teamImg!: string;
  @Expose()
  public description!: string;
}

export class TeamRequestDTO {
  @Expose()
  public title!: string;
  @Expose()
  public users?: number[];
  @Expose()
  public teamImg!: string;
  @Expose()
  public description!: string;
}
