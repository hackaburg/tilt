import { IActivity } from "./activity";
import { ISuccessfulApiResponse } from "./api";

export interface IWebSocketMessage
  extends ISuccessfulApiResponse<IWebSocketMessageData> {
  data: IWebSocketMessageData;
}

export const enum WebSocketMessageType {
  Token = "token",
  Activity = "activity",
}

export interface IWebSocketTokenMessageData {
  type: WebSocketMessageType.Token;
  token: string;
}

export interface IWebSocketActivityMessageData {
  type: WebSocketMessageType.Activity;
  activity: IActivity[];
}

export type IWebSocketMessageData =
  | IWebSocketTokenMessageData
  | IWebSocketActivityMessageData;
