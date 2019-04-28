import { Type } from "class-transformer";
import { IsEmail, IsOptional, IsString, ValidateNested } from "class-validator";
import { IRecursivePartial } from "../../../types/api";
import { IEmailSettings, IEmailTemplate, IFrontendSettings, ISettings, IUpdateSettingsApiRequest } from "../../../types/settings";

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

class UpdateSettings implements IRecursivePartial<ISettings> {
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
