import { Type } from "class-transformer";
import { IsDefined, IsEmail, IsEmpty, IsString, ValidateNested } from "class-validator";
import { IEmailTemplate, IEmailTemplates } from "../../../types/settings";
import { IUpdateEmailSettingsApiRequest, IUpdateEmailSettingsRequestBody, IUpdateEmailTemplatesApiRequest, IUpdateEmailTemplatesRequestBody } from "../../../types/settings-email";

class ValidatedEmailTemplate implements IEmailTemplate {
  @IsDefined()
  @IsString()
  public subject!: string;

  @IsDefined()
  @IsString()
  public textTemplate!: string;

  @IsDefined()
  @IsString()
  public htmlTemplate!: string;
}

class ValidatedEmailTemplates implements IUpdateEmailTemplatesRequestBody {
  @ValidateNested()
  @Type(() => ValidatedEmailTemplate)
  public verifyEmail!: IEmailTemplate;

  @ValidateNested()
  @Type(() => ValidatedEmailTemplate)
  public forgotPasswordEmail!: IEmailTemplate;
}

export class UpdateEmailTemplatesApiRequest implements IUpdateEmailTemplatesApiRequest {
  @IsDefined()
  @ValidateNested()
  @Type(() => ValidatedEmailTemplates)
  public data!: IUpdateEmailTemplatesRequestBody;
}

class ValidatedEmailSettings implements IUpdateEmailSettingsRequestBody {
  @IsDefined()
  @IsEmail()
  @IsString()
  public sender!: string;

  @IsEmpty()
  public templates!: IEmailTemplates;
}

export class UpdateEmailSettingsApiRequest implements IUpdateEmailSettingsApiRequest {
  @IsDefined()
  @ValidateNested()
  @Type(() => ValidatedEmailSettings)
  public data!: IUpdateEmailSettingsRequestBody;
}
