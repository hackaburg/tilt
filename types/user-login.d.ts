import { UserRole } from "./roles";

export interface IUserLoginRequestBody {
  email: string;
  password: string;
}

export interface IUserLoginResponseBody {
  token: string;
  role: UserRole;
}
