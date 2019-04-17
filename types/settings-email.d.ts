import { IApiRequest } from "./api";
import { IEmailSettings } from "./settings";

export interface IUpdateEmailSettingsApiRequest extends IApiRequest<IEmailSettings> { }
