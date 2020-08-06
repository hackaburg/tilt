import * as React from "react";
import { useCallback, useMemo, useState } from "react";
import FlexView from "react-flexview";
import { useDebounce } from "use-debounce";
import type { SettingsDTO } from "../api/types/dto";
import { SuspenseFallback } from "../components/base/suspense-fallback";
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

  const [isSynchronized, setIsSynchronized] = useState(false);
  const [localSettings, setLocalSettings] = useState<Nullable<SettingsDTO>>(
    null,
  );

  const { isFetching: isFetchingSettings, error: fetchError } = useApi(
    async (api) => {
      const settings = await api.getSettings();
      setLocalSettings(settings);
      setIsSynchronized(true);
    },
    [],
  );

  if (fetchError) {
    throw fetchError;
  }

  if (!isFetchingSettings && localSettings == null) {
    throw new Error("No settings received from the server");
  }

  const updateSettings = useCallback((settings: SettingsDTO) => {
    if (settings != null) {
      setLocalSettings(settings);
      setIsSynchronized(false);
    }
  }, []);

  // we only want to save our settings if we know we're out of sync with the db
  // this only happens when we locally modify the `localSettings` state. if we
  // omit the `isSynchronized` check, we end up with an infinite loop. if we
  // don't debounce the synchronization, we might look synced, even though we're
  // out of date. we need to check both "from the same time"
  const [[debouncedSettings, debouncedIsSynchronized]] = useDebounce<
    [typeof localSettings, typeof isSynchronized]
  >([localSettings, isSynchronized], debounceDuration);

  const { error: updateError } = useApi(
    async (api) => {
      if (debouncedSettings != null && !debouncedIsSynchronized) {
        const updatedSettings = await api.updateSettings(debouncedSettings);

        setLocalSettings(updatedSettings);
        setIsSynchronized(true);

        showNotification("Changes saved");
      }
    },
    [debouncedSettings, debouncedIsSynchronized],
  );

  const value = useMemo<ISettingsContextValue>(
    () => ({
      settings: localSettings as SettingsDTO,
      updateError,
      updateSettings,
    }),
    [localSettings, updateSettings, updateError],
  );

  if (isFetchingSettings || localSettings == null) {
    return (
      <FlexView height="100vh" grow>
        <SuspenseFallback />
      </FlexView>
    );
  }

  return <Context.Provider value={value}>{children}</Context.Provider>;
};

/**
 * Gets the settings context's value.
 */
export const useSettingsContext = () => useContextOrThrow(Context);
