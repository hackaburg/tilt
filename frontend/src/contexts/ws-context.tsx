import * as React from "react";
import { useMemo } from "react";
import { apiBaseUrl } from "../config";
import { useContextOrThrow } from "../hooks/use-context-or-throw";
import { Nullable } from "../state";
import { WebSocketHandler } from "../ws";

const Context = React.createContext<Nullable<WebSocketHandler>>(null);

interface IWebSocketContextProviderProps {
  children: React.ReactNode;
}

/**
 * A context to provide a websocket connection to the server.
 * @param props The props to pass to this context
 */
export const WebSocketContextProvider = ({
  children,
}: IWebSocketContextProviderProps) => {
  const ws = useMemo(() => new WebSocketHandler(apiBaseUrl), []);
  return <Context.Provider value={ws}>{children}</Context.Provider>;
};

/**
 * Gets the websocket context's value.
 */
export const useWebSocketContext = (): WebSocketHandler =>
  useContextOrThrow(Context);
