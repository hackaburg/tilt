import { useEffect, useState } from "react";
import { IApi } from "../api";
import { BackendApi } from "../api/backend-api";
import { StaticApi } from "../api/static-api";
import { apiBaseUrl } from "../config";
import { Nullable } from "../state";

const api: IApi = apiBaseUrl ? new BackendApi(apiBaseUrl) : new StaticApi();

/**
 * Gets a result from the api.
 * @param callback A consumer returning values from the api
 * @param deps Dependencies inside the callback requiring the call to run again
 */
export const useApi = <T>(
  callback: (api: IApi) => Promise<T>,
  deps: readonly any[] = [],
): [Nullable<T>, boolean, Nullable<Error>] => {
  const [isFetching, setIsFetching] = useState(false);
  const [value, setValue] = useState<Nullable<T>>(null);
  const [error, setError] = useState<Nullable<Error>>(null);

  useEffect(() => {
    (async () => {
      setIsFetching(true);
      setError(null);
      setValue(null);

      try {
        const result = await callback(api);
        setValue(result);
      } catch (error) {
        setError(error);
      }

      setIsFetching(false);
    })();
  }, deps);

  return [value, isFetching, error];
};
