import { IApiResponse } from "./api";

export interface IUserSignupRequestBody {
  email: string;
  password: string;
}

export interface IUserSignupResponseBody {
  email: string;
}
