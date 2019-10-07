import { Dispatch } from "redux";
import { IWebSocketMessageHandler } from ".";
import {
  IWebSocketActivityMessageData,
  WebSocketMessageType,
} from "../../../types/ws";
import { addActivities } from "../actions/activity";

export class ActivityWebSocketHandler implements IWebSocketMessageHandler {
  public type: WebSocketMessageType = WebSocketMessageType.Activity;

  constructor(private readonly _dispatch: Dispatch) {}

  /**
   * Adds the activities from the message to the local store.
   * @param data The data received from the server
   */
  public onMessage({ activity }: IWebSocketActivityMessageData): void {
    this._dispatch(addActivities(activity));
  }
}
