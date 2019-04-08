import { ISettings } from "../../types/settings";

/**
 * Describes the frontend state.
 */
export interface IState {
  request: IRequest;
  settings: IFetchable<ISettings>;
  signup: IFetchable<string>;
  login: IFetchable<string>;
}

interface IRequest {
  requestInProgress: boolean;
  error?: string;
}

interface IFetchable<T> {
  data: T;
  fetchInProgress: boolean;
  error: string;
}
