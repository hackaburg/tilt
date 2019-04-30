import { Type } from "class-transformer";
import { Equals, IsArray, IsBoolean, IsDate, IsEmail, IsNumber, IsOptional, IsPositive, IsString, MinLength, ValidateNested } from "class-validator";
import { IRecursivePartial } from "../../../types/api";
import { IChoicesQuestion, ICountryQuestion, INumberQuestion, IQuestion, IQuestionBase, ITextQuestion, QuestionType } from "../../../types/questions";
import { IApplicationSettings, IEmailSettings, IEmailTemplate, IFormSettings, IFrontendSettings, ISettings, IUpdateSettingsApiRequest } from "../../../types/settings";
import { enforceExhaustiveSwitch } from "../utils/switch";
import { ArrayType } from "./polymorphism";

class UpdateFrontendSettings implements IRecursivePartial<IFrontendSettings> {
  @IsOptional()
  @IsString()
  public colorGradientStart?: string;

  @IsOptional()
  @IsString()
  public colorGradientEnd?: string;

  @IsOptional()
  @IsString()
  public colorLink?: string;

  @IsOptional()
  @IsString()
  public colorLinkHover?: string;

  @IsOptional()
  @IsString()
  public loginSignupImage?: string;

  @IsOptional()
  @IsString()
  public sidebarImage?: string;
}

class UpdateEmailTemplate implements IRecursivePartial<IEmailTemplate> {
  @IsOptional()
  @IsString()
  public subject?: string;

  @IsOptional()
  @IsString()
  public textTemplate?: string;

  @IsOptional()
  @IsString()
  public htmlTemplate?: string;
}

class UpdateEmailSettings implements IRecursivePartial<IEmailSettings> {
  @IsOptional()
  @IsEmail()
  public sender!: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateEmailTemplate)
  public verifyEmail?: IEmailTemplate;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateEmailTemplate)
  public forgotPasswordEmail?: IEmailTemplate;
}

class UpdateQuestionBase implements IRecursivePartial<IQuestionBase> {
  @IsOptional()
  @IsString()
  public description!: string;

  @IsOptional()
  @IsString()
  public title!: string;

  @IsOptional()
  @IsBoolean()
  public mandatory!: boolean;

  @IsString()
  @MinLength(1)
  public referenceName!: string;

  @IsOptional()
  @IsString()
  public parentReferenceName?: string;

  @IsOptional()
  @IsString()
  public showIfParentHasValue?: string;
}

class UpdateTextQuestion extends UpdateQuestionBase implements IRecursivePartial<ITextQuestion> {
  @Equals(QuestionType.Text)
  public type!: QuestionType.Text;

  @IsOptional()
  @IsString()
  public placeholder?: string;

  @IsOptional()
  @IsBoolean()
  public multiline?: boolean;
}

class UpdateNumberQuestion extends UpdateQuestionBase implements IRecursivePartial<INumberQuestion> {
  @Equals(QuestionType.Number)
  public type!: QuestionType.Number;

  @IsOptional()
  @IsString()
  public placeholder?: string;

  @IsOptional()
  @IsNumber()
  public minValue?: number;

  @IsOptional()
  @IsNumber()
  public maxValue?: number;

  @IsOptional()
  @IsBoolean()
  public allowDecimals?: boolean;
}

class UpdateChoicesQuestion extends UpdateQuestionBase implements IRecursivePartial<IChoicesQuestion> {
  @Equals(QuestionType.Choices)
  public type!: QuestionType.Choices;

  @IsArray()
  @IsString({ each: true })
  public choices!: string[];

  @IsOptional()
  @IsBoolean()
  public allowMultiple?: boolean;

  @IsOptional()
  @IsBoolean()
  public displayAsDropdown?: boolean;
}

class UpdateCountryQuestion extends UpdateQuestionBase implements IRecursivePartial<ICountryQuestion> {
  @Equals(QuestionType.Country)
  public type!: QuestionType.Country;
}

class UpdateFormSettings implements IRecursivePartial<IFormSettings> {
  @IsOptional()
  @IsString()
  @MinLength(1)
  public title?: string;

  @IsArray()
  @ArrayType((values: IQuestion[]) => values.map(({ type }) => {
    switch (type) {
      case QuestionType.Text:
        return UpdateTextQuestion;

      case QuestionType.Number:
        return UpdateNumberQuestion;

      case QuestionType.Choices:
        return UpdateChoicesQuestion;

      case QuestionType.Country:
        return UpdateCountryQuestion;

      default:
        enforceExhaustiveSwitch(type);
        return UpdateQuestionBase;
    }
  }))
  public questions!: IQuestion[];
}

class UpdateApplicationSettings implements IRecursivePartial<IApplicationSettings> {
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateFormSettings)
  public profileForm?: IFormSettings;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateFormSettings)
  public confirmationForm?: IFormSettings;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  public allowProfileFormFrom?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  public allowProfileFormUntil?: Date;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  public hoursToConfirm?: number;
}

class UpdateSettings implements IRecursivePartial<ISettings> {
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateApplicationSettings)
  public application?: IApplicationSettings;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateFrontendSettings)
  public frontend?: IFrontendSettings;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateEmailSettings)
  public email?: IEmailSettings;
}

export class UpdateSettingsApiRequest implements IUpdateSettingsApiRequest {
  @ValidateNested()
  @Type(() => UpdateSettings)
  public data!: IRecursivePartial<ISettings>;
}
