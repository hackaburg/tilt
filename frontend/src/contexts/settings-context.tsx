import * as React from "react";
import { useCallback, useMemo, useState } from "react";
import { useDebounce } from "use-debounce";
import type { SettingsDTO } from "../api/types/dto";
import { Spinner } from "../components/spinner";
import { debounceDuration } from "../config";
import { useApi } from "../hooks/use-api";
import { useContextOrThrow } from "../hooks/use-context-or-throw";
import { Nullable } from "../state";
import { useNotificationContext } from "./notification-context";

interface ISettingsContextValue {
  settings: SettingsDTO;
  updateSettings: (settings: SettingsDTO) => void;
  updateError: Nullable<Error>;
}

const Context = React.createContext<Nullable<ISettingsContextValue>>(null);
Context.displayName = "SettingsContext";

interface ISettingsContextProviderProps {
  children: React.ReactNode;
}

/**
 * A context storing and loading the application settings
 * @param props The props to pass to this context
 */
export const SettingsContextProvider = ({
  children,
}: ISettingsContextProviderProps) => {
  const { showNotification } = useNotificationContext();
  const [localSettings, setLocalSettings] = useState<Nullable<SettingsDTO>>(
    null,
  );
  const [
    fetchedSettings,
    isFetchingSettings,
    fetchError,
  ] = useApi(async (api) => api.getSettings());

  if (fetchError) {
    throw fetchError;
  }

  if (!isFetchingSettings && fetchedSettings == null) {
    throw new Error("No settings received from the server");
  }

  const updateSettings = useCallback((settings: SettingsDTO) => {
    if (settings != null) {
      setLocalSettings(settings);
    }
  }, []);

  const [debouncedSettings] = useDebounce(localSettings, debounceDuration);
  const [, , updateError] = useApi(
    async (api) => {
      if (debouncedSettings != null) {
        await api.updateSettings(debouncedSettings);
        showNotification("Changes saved");
      }
    },
    [debouncedSettings],
  );

  const value = useMemo<ISettingsContextValue>(
    () => ({
      settings: localSettings ?? (fetchedSettings as SettingsDTO),
      updateError,
      updateSettings,
    }),
    [localSettings, fetchedSettings, updateSettings, updateError],
  );

  if (isFetchingSettings) {
    return <Spinner />;
  }

  return <Context.Provider value={value}>{children}</Context.Provider>;
};

/**
 * Gets the settings context's value.
 */
export const useSettingsContext = () => useContextOrThrow(Context);
