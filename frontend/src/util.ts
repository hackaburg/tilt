import { UserDTO } from "./api/types/dto";

/**
 * T or null
 */
export type Nullable<T> = T | null;

/**
 * Async equivalent of a sleep/wait call.
 * @param ms The duration to sleep
 */
export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const prependZero = (value: number): string =>
  value < 10 ? `0${value}` : `${value}`;

/**
 * Formats a date "YYYY-MM-DD on HH:mm:ss" style.
 * @param date The date to format
 */
export const dateToString = (date: Date) =>
  `${prependZero(date.getDate())}.${prependZero(
    date.getMonth() + 1,
  )}.${date.getFullYear()}`;

/**
 * Extracts all public fields from a type to a new type. This is mainly used to
 * implement classes that contain non-public fields.
 */
export type PublicFields<T> = {
  [K in keyof T]: T[K];
};

/**
 * Splits an array based on a filter function. The first returned value includes
 * items matching the predicate and the second returned value resembles the rest.
 * @param array The array to filter
 * @param predicate A function to call on each item to check whether it should be included
 */
export const filterSplit = <T>(
  array: readonly T[],
  predicate: (value: T, index: number) => boolean,
): [readonly T[], readonly T[]] => {
  const matches = [] as T[];
  const rest = [] as T[];

  for (let index = 0; index < array.length; index++) {
    const value = array[index];
    const isMatch = predicate(value, index);

    if (isMatch) {
      matches.push(value);
    } else {
      rest.push(value);
    }
  }

  return [matches, rest];
};

/**
 * Checks whether the given user's confirmation deadline passed.
 * @param user The user to check for expiration
 */
export const isConfirmationExpired = (user: UserDTO): boolean =>
  !user.confirmed &&
  user.confirmationExpiresAt != null &&
  user.confirmationExpiresAt.getTime() <= Date.now();

/**
 * Checks whether the given date is valid.
 * @param date A date to check for validity
 */
export const isValidDate = (date: Date) => !isNaN(date.getTime());

/**
 * Repeats the given array until it has the given length.
 * @param array An array to repeat
 * @param expectedLength The expected length of the final array
 */
export const repeatAndTake = <T>(
  array: readonly T[],
  expectedLength: number,
): readonly T[] => {
  if (array.length >= expectedLength) {
    return array.slice(0, expectedLength);
  }

  let result = [] as readonly T[];

  while (expectedLength > 0) {
    result = result.concat(array.slice(0, expectedLength));
  }

  return result;
};

/**
 * Converts a percentage to a human readable striing;
 * @param percentage The percentage number value
 */
export const percentageToString = (percentage: number): string =>
  `${Math.floor(percentage * 100)}%`;

/**
 * Floors the given date to the day's start.
 * @param date The date to round
 */
export const roundDateToDay = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDay());

/**
 * Checks whether the given value is between the lower and upper bounds.
 * @param lowerBound The lower bound
 * @param x The value
 * @param upperBound The upper bound
 */
export const isBetween = (
  lowerBound: number,
  x: number,
  upperBound: number,
): boolean => lowerBound <= x && x <= upperBound;

/**
 * Prevent division by zero using this method.
 */
export const safeDivide = (a: number, b: number): number => {
  if (b === 0) {
    return 0;
  }

  return a / b;
};

const isOutOfBounds = <T>(array: readonly T[], index: number): boolean => {
  return index < 0 || index >= array.length;
};

const swapArrayItems = <T>(
  array: readonly T[],
  fromIndex: number,
  toIndex: number,
): T[] => {
  if (isOutOfBounds(array, fromIndex) || isOutOfBounds(array, toIndex)) {
    return array.slice();
  }

  return array.map((item, index) => {
    if (index === fromIndex) {
      return array[toIndex];
    }

    if (index === toIndex) {
      return array[fromIndex];
    }

    return item;
  });
};

/**
 * Moves the questions above the previous question.
 */
export const moveArrayItemUp = <T>(array: readonly T[], index: number): T[] => {
  return swapArrayItems(array, index, index - 1);
};

/**
 * Moves the questions below the flowing question.
 */
export const moveArrayItemDown = <T>(
  array: readonly T[],
  index: number,
): T[] => {
  return swapArrayItems(array, index, index + 1);
};

/**
 * Convert errors into strings.
 */
export const errorToString = (error: unknown): string => {
  if (error instanceof Error) {
    return `${error.message}\n${error.stack}`;
  }

  return String(error);
};
