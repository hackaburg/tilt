import { Type } from "class-transformer";
import { IsDefined, IsString, ValidateNested } from "class-validator";
import { IEmailSettings, IEmailTemplate } from "../../../types/settings";
import { IUpdateEmailSettingsApiRequest } from "../../../types/settings-email";

class ValidatedEmailTemplate implements IEmailTemplate {
  @IsDefined()
  @IsString()
  public textTemplate!: string;

  @IsDefined()
  @IsString()
  public htmlTemplate!: string;
}

class ValidatedEmailSettings implements IEmailSettings {
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
  @Type(() => ValidatedEmailSettings)
  public data!: IEmailSettings;
}
