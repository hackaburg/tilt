export interface IApiRequest<T> {
  data: T;
}

interface ISuccessfulApiResponse<T> {
  status: "ok";
  data: T;
}

interface IErrorApiResponse {
  status: "error";
  error: string;
}

export type IApiResponse<T> = ISuccessfulApiResponse<T> | IErrorApiResponse;
