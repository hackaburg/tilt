import { User } from "../entities/user";

type ExtractArguments<T> = T extends (...args: infer Args) => any
  ? Args
  : never;

type IgnoredArguments = User | string | undefined;
type ExtractFirstArgument<T> = ExtractArguments<T>[0] extends IgnoredArguments
  ? never
  : ExtractArguments<T>[0];

type ExtractReturnType<T> = T extends (...args: any[]) => infer R ? R : never;
type ExtractPromise<T> = T extends Promise<infer K> ? K : T;
type ExtractAllFunctions<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any ? T[K] : never;
};

/**
 * Type definitions for an API method.
 */
export interface IApiMethod<TArgument, TReturnValue> {
  takes: TArgument;
  returns: TReturnValue;
}

/**
 * A successful response from the API.
 */
export interface ISuccessfulApiResponse<T> {
  status: "ok";
  data: T;
}

/**
 * A failed API response.
 */
export interface IErrorApiResponse {
  status: "error";
  error: string;
}

/**
 * A response from the API.
 */
export type IApiResponse<T> = ISuccessfulApiResponse<T> | IErrorApiResponse;

/**
 * Gets the actual value sent from the API.
 */
export type ExtractSuccessfulApiResponse<T> = T extends IApiResponse<infer K>
  ? K
  : never;

/**
 * A request body to the API.
 */
export interface IApiRequest<T> {
  data: T;
}

/**
 * Extracts all API methods from the given function into a new type.
 */
export type ExtractControllerMethods<TController> = {
  [K in keyof ExtractAllFunctions<TController>]: IApiMethod<
    ExtractFirstArgument<TController[K]>,
    ISuccessfulApiResponse<ExtractPromise<ExtractReturnType<TController[K]>>>
  >;
};
