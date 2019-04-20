import { IApiRequest } from "./api";
import { IEmailTemplates } from "./settings";

export interface IUpdateEmailSettingsApiRequest extends IApiRequest<IEmailTemplates> { }
