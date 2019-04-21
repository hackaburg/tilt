import { IApiRequest } from "./api";
import { IEmailTemplates } from "./settings";

export type IUpdateEmailTemplatesRequestBody = IEmailTemplates;
export interface IUpdateEmailTemplatesApiRequest extends IApiRequest<IUpdateEmailTemplatesRequestBody> { }
