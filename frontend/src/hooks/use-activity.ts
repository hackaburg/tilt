import { useEffect, useState } from "react";
import { IActivity } from "../../../types/activity";
import { WebSocketMessageType } from "../../../types/ws";
import { useWebSocketContext } from "../contexts/ws-context";
import { WebSocketMessageHandler } from "../ws";
import { useApi } from "./use-api";

/**
 * Gets a continuously updated stream of activities.
 */
export const useActivity = (): readonly IActivity[] => {
  const [activity, setActivity] = useState<IActivity[]>([]);

  useApi(async (api) => {
    const apiActivity = await api.getActivities();

    setActivity((state) =>
      [...state, ...apiActivity].sort((a, b) => b.timestamp - a.timestamp),
    );
  });

  const ws = useWebSocketContext();

  useEffect(() => {
    const handler: WebSocketMessageHandler = (data) => {
      if (data.type === WebSocketMessageType.Activity) {
        setActivity((state) => [...data.activity, ...state]);
      }
    };

    ws.registerMessageHandler(handler);

    return () => ws.unregisterMessageHandler(handler);
  }, [ws]);

  return activity;
};
