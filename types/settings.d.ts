import { IQuestionBase } from "./questions";
import { IApiResponse, IApiRequest, IRecursivePartial } from "./api";

export type IGetSettingsApiResponse = IApiResponse<ISettings>;
export type IUpdateSettingsRequestBody = IRecursivePartial<ISettings>
export type IUpdateSettingsApiRequest = IApiRequest<IUpdateSettingsRequestBody>;

export interface ISettings {
  frontend: IFrontendSettings;
  email: IEmailSettings;
}

export interface IFrontendSettings {
  colorGradientStart: string;
  colorGradientEnd: string;
  colorLink: string;
  colorLinkHover: string;
  loginSignupImage: string;
  sidebarImage: string;
}

export interface IEmailSettings {
  sender: string;
  verifyEmail: IEmailTemplate;
  forgotPasswordEmail: IEmailTemplate;
}

export interface IEmailTemplate {
  subject: string;
  textTemplate: string;
  htmlTemplate: string;
}
