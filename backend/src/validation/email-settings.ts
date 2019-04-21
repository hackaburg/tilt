import { Type } from "class-transformer";
import { IsDefined, IsEmail, IsEmpty, IsString, ValidateNested } from "class-validator";
import { IEmailTemplates } from "../../../types/settings";
import { IUpdateEmailSettingsApiRequest, IUpdateEmailSettingsRequestBody } from "../../../types/settings-email";

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
