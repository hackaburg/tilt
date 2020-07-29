import { useCallback, useEffect, useState } from "react";
import { ApiClient } from "../api";
import { apiBaseUrl } from "../config";
import { Nullable } from "../state";

const api = new ApiClient(apiBaseUrl);

/**
 * Gets a result from the api.
 * @param callback A consumer returning values from the api
 * @param deps Dependencies inside the callback requiring the call to run again
 */
export const useApi = <T>(
  callback: (api: ApiClient, wasForced: boolean) => Promise<T>,
  deps: readonly any[] = [],
): [Nullable<T>, boolean, Nullable<Error>, () => void] => {
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
      setError(error);
    }

    setIsFetching(false);
  }, deps);

  useEffect(() => {
    performRequest(false);
  }, deps);

  const forcePerformRequest = useCallback(() => performRequest(true), [
    performRequest,
  ]);

  return [value, isFetching, error, forcePerformRequest];
};
