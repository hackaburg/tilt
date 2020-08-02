import * as React from "react";
import { useCallback, useMemo, useState } from "react";
import { Notification } from "../components/base/notification";
import { notificationDuration } from "../config";
import { useContextOrThrow } from "../hooks/use-context-or-throw";
import { Nullable } from "../state";
import { sleep } from "../util";

interface INotificationContextValue {
  showNotification: (message: string) => void;
}

const Context = React.createContext<Nullable<INotificationContextValue>>(null);
Context.displayName = "NotificationContext";

interface INotificationContextProps {
  children: React.ReactNode;
}

/**
 * A context to display notifications.
 * @param props The props to pass to this context
 */
export const NotificationContextProvider = ({
  children,
}: INotificationContextProps) => {
  const [message, setMessage] = useState("");
  const [isShown, setIsShown] = useState(false);
  const showNotification = useCallback(async (messageToShow: string) => {
    setMessage(messageToShow);
    setIsShown(true);
    await sleep(notificationDuration);
    setIsShown(false);
  }, []);

  const value = useMemo(
    () => ({
      showNotification,
    }),
    [showNotification],
  );

  return (
    <Context.Provider value={value}>
      {children}
      <Notification show={isShown} message={message} />
    </Context.Provider>
  );
};

/**
 * Gets the notification context's value.
 */
export const useNotificationContext = (): INotificationContextValue =>
  useContextOrThrow(Context);
