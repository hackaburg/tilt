import { Dispatch } from "redux";

/**
 * An empty action.
 */
export interface IEmptyAction<TType> {
  type: TType;
}

/**
 * An action with a value
 */
export interface IAction<TType, TValue> extends IEmptyAction<TType> {
  value: TValue;
}

type IAsyncAction = (dispatch: Dispatch) => Promise<any>;
type ActionCreator = (...args: any[]) => any;
type NonAsyncActionCreatorReturnType<T extends ActionCreator> =
  ReturnType<T> extends IAsyncAction
    ? never
    : ReturnType<T>;

/**
 * Return types from action creators.
 */
export type IActionReturnTypes<T> = {
  [P in keyof T]:
    T[P] extends ActionCreator
      ? NonAsyncActionCreatorReturnType<T[P]>
      : never;
}[keyof T];
