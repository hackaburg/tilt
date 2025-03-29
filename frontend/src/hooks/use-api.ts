import { useCallback, useEffect, useState } from "react";
import { ApiClient } from "../api";
import { apiBaseUrl } from "../config";
import { Nullable } from "../util";

/**
 * Export Api Client
 */
export const api = new ApiClient(apiBaseUrl);

interface IApiResult<T> {
  value: Nullable<T>;
  isFetching: boolean;
  error: Nullable<Error>;
  forcePerformRequest: () => void;
}

/**
 * Gets a result from the api.
 * @param callback A consumer returning values from the api
 * @param deps Dependencies inside the callback requiring the call to run again
 */
export const useApi = <T>(
  callback: (api: ApiClient, wasForced: boolean) => Promise<T>,
  deps: readonly any[] = [],
): IApiResult<T> => {
  const [isFetching, setIsFetching] = useState(true);
  const [value, setValue] = useState<Nullable<T>>(null);
  const [error, setError] = useState<Nullable<Error>>(null);

  const performRequest = useCallback(async (wasForced: boolean) => {
    setIsFetching(true);
    setError(null);
    setValue(null);

    try {
      const result = await callback(api, wasForced);
      setValue(result);
    } catch (error) {
      if (error instanceof Error) {
        setError(error);
      } else {
        setError(new Error(String(error)));
      }
    }

    setIsFetching(false);
  }, deps);

  useEffect(() => {
    performRequest(false);
  }, deps);

  const forcePerformRequest = useCallback(
    () => performRequest(true),
    [performRequest],
  );

  return {
    error,
    forcePerformRequest,
    isFetching,
    value,
  };
};

/**
 * Gets a result from the api without a hook.
 * @param callback A consumer returning values from the api
 */
export const performApiRequest = <T>(
  callback: (api: ApiClient) => Promise<T>,
): Promise<T> => callback(api);
