import * as React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { SettingsDTO } from "../api/types/dto";
import { PageSizedContainer } from "../components/base/flex";
import { SuspenseFallback } from "../components/base/suspense-fallback";
import { useApi } from "../hooks/use-api";
import { useContextOrThrow } from "../hooks/use-context-or-throw";
import { Nullable } from "../util";
import { useNotificationContext } from "./notification-context";

interface ISettingsContextValue {
  settings: SettingsDTO;
  updateSettings: (settings: SettingsDTO) => void;
  save: () => void;
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
  const [localSettings, setLocalSettings] =
    useState<Nullable<SettingsDTO>>(null);

  const [isLocallyUpdated, setIsLocallyUpdated] = useState(false);

  useEffect(() => {
    if (!isLocallyUpdated) {
      return;
    }

    const handleUnload = (event: Event) => {
      const wantsToLeave = window.confirm(
        "Unsaved changes, are you sure you want to leave?",
      );

      if (wantsToLeave) {
        return;
      }

      event.preventDefault();
      return false;
    };

    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [isLocallyUpdated]);

  const { isFetching: isFetchingSettings, error: fetchError } = useApi(
    async (api) => {
      const settings = await api.getSettings();
      setLocalSettings(settings);
      setIsLocallyUpdated(false);
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
      setIsLocallyUpdated(true);
    }
  }, []);

  const { forcePerformRequest: save } = useApi(
    async (api, wasForced) => {
      if (!wasForced || localSettings == null) {
        return;
      }

      const updatedSettings = await api.updateSettings(localSettings);

      setLocalSettings(updatedSettings);
      showNotification("Changes saved");
    },
    [localSettings],
  );

  const value = useMemo<ISettingsContextValue>(
    () => ({
      settings: localSettings as SettingsDTO,
      updateSettings,
      save,
    }),
    [localSettings, updateSettings, save],
  );

  if (isFetchingSettings || localSettings == null) {
    return (
      <PageSizedContainer>
        <SuspenseFallback />
      </PageSizedContainer>
    );
  }

  return <Context.Provider value={value}>{children}</Context.Provider>;
};

/**
 * Gets the settings context's value.
 */
export const useSettingsContext = () => useContextOrThrow(Context);
