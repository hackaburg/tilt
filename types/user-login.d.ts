export interface IUserLoginRequestBody {
  email: string;
  password: string;
}

export interface IUserLoginResponseBody {
  token: string;
}
