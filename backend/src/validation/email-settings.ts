import { Type } from "class-transformer";
import { IsDefined, IsString, ValidateNested } from "class-validator";
import { IEmailTemplate, IEmailTemplates } from "../../../types/settings";
import { IUpdateEmailSettingsApiRequest } from "../../../types/settings-email";

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

class ValidatedEmailTemplates implements IEmailTemplates {
  @ValidateNested()
  @Type(() => ValidatedEmailTemplate)
  public verifyEmail!: IEmailTemplate;

  @ValidateNested()
  @Type(() => ValidatedEmailTemplate)
  public forgotPasswordEmail!: IEmailTemplate;
}

export class UpdateEmailSettingsApiRequest implements IUpdateEmailSettingsApiRequest {
  @IsDefined()
  @ValidateNested()
  @Type(() => ValidatedEmailTemplates)
  public data!: IEmailTemplates;
}
