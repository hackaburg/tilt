import { ISettings } from "../../types/settings";

/**
 * Describes the frontend state.
 */
export interface IState {
  settings: IFetchable<ISettings>;
}

interface IFetchable<T> {
  data: T;
  fetchInProgress: boolean;
  error: string;
}
