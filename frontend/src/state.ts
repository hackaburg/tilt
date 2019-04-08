import { ISettings } from "../../types/settings";

/**
 * Describes the frontend state.
 */
export interface IState {
  settings: IFetchable<ISettings>;
  signup: IFetchable<string>;
}

interface IFetchable<T> {
  data: T;
  fetchInProgress: boolean;
  error: string;
}
