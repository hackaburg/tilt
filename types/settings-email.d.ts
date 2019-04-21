import { IApiRequest } from "./api";
import { IEmailTemplates, IEmailSettings } from "./settings";

export type IUpdateEmailTemplatesRequestBody = IEmailTemplates;
export interface IUpdateEmailTemplatesApiRequest extends IApiRequest<IUpdateEmailTemplatesRequestBody> { }

export type IUpdateEmailSettingsRequestBody = IEmailSettings;
export interface IUpdateEmailSettingsApiRequest extends IApiRequest<IUpdateEmailSettingsRequestBody> { }
