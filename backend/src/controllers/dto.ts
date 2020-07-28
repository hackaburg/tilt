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
  MinLength,
  ValidateNested,
} from "class-validator";
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
  FrontendSettings,
  Settings,
} from "../entities/settings";
import { UserRole } from "../entities/user-role";
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

export class SettingsDTO implements DTO<Settings> {
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
  @Expose()
  public questions!: QuestionDTO[];
}

export abstract class QuestionConfigurationDTOBase {
  @Expose()
  public type!: QuestionType;
}

export class TextQuestionConfigurationDTO
  implements ITextQuestionConfiguration {
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
  implements INumberQuestionConfiguration {
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
  implements IChoicesQuestionConfiguration {
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
  implements ICountryQuestionConfiguration {
  public type!: QuestionType.Country;
}

export class QuestionDTO<TQuestionConfigurationDTO = IQuestionConfiguration>
  implements DTO<Omit<Question, "form" | "parent">> {
  @IsInt()
  @Expose()
  public id?: number;
  @Transform(
    (value: IQuestionConfiguration) => {
      const type = value.type as QuestionType;

      switch (type) {
        case QuestionType.Text:
          return plainToClass(TextQuestionConfigurationDTO, [value]);

        case QuestionType.Number:
          return plainToClass(NumberQuestionConfigurationDTO, [value]);

        case QuestionType.Choices:
          return plainToClass(ChoicesQuestionConfigurationDTO, [value]);

        case QuestionType.Country:
          return plainToClass(CountryQuestionConfigurationDTO, [value]);

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
  public parentID?: number;
  @IsOptional()
  @IsString()
  @Expose()
  public showIfParentHasValue?: string;
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
}

export class EmailTemplateDTO implements DTO<EmailTemplate> {
  @IsString()
  @Expose()
  public subject!: string;
  @IsString()
  @Expose()
  public htmlTemplate!: string;
  @IsString()
  @Expose()
  public textTemplate!: string;
}

export class UpdateSettingsRequestDTO implements IApiRequest<SettingsDTO> {
  @Type(() => SettingsDTO)
  @ValidateNested()
  @Expose()
  public data!: SettingsDTO;
}

export class CredentialsDTO {
  @IsEmail()
  public email!: string;
  @IsString()
  @MinLength(6)
  public password!: string;
}

export class CredentialsRequestDTO implements IApiRequest<CredentialsDTO> {
  @Type(() => CredentialsDTO)
  @ValidateNested()
  public data!: CredentialsDTO;
}

export class SignupResponseDTO {
  @Expose()
  public email!: string;
}

export class LoginResponseDTO {
  @Expose()
  public token!: string;
  @Expose()
  public role!: UserRole;
}

export class SuccessResponseDTO {
  @Expose()
  public success!: boolean;
}

export class RefreshTokenResponseDTO {
  @Expose()
  public token!: string;
  @Expose()
  public role!: UserRole;
}
