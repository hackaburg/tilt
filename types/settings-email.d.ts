import { IApiRequest } from "./api";
import { IEmailTemplates } from "./settings";

export type IUpdateEmailSettingsRequestBody = IEmailTemplates;
export interface IUpdateEmailSettingsApiRequest extends IApiRequest<IUpdateEmailSettingsRequestBody> { }
