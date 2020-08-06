import { UserDTO } from "./api/types/dto";

/**
 * Async equivalent of a sleep/wait call.
 * @param ms The duration to sleep
 */
export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Gets the month name of the given date, e.g. January for "1970-01-01".
 * @param date A date to get the month from
 */
export const getMonthName = (date: Date) =>
  date.toLocaleDateString("en", { month: "long" });

interface ITimestamped {
  timestamp: number;
}

interface IMonthlyGroupedData<T> {
  month: string;
  data: T[];
}

/**
 * Groups data based on its timestamp into months.
 * @param data Data to group
 */
export const groupByMonth = <T extends ITimestamped>(
  data: readonly T[],
): Array<IMonthlyGroupedData<T>> =>
  data.reduce<Array<IMonthlyGroupedData<T>>>((months, value) => {
    const date = new Date(value.timestamp);
    const monthName = getMonthName(date);
    const name = `${monthName} ${date.getFullYear()}`;
    const previousMonth = months[months.length - 1];

    if (!previousMonth || previousMonth.month !== name) {
      months.push({
        data: [],
        month: name,
      });
    }

    months[months.length - 1].data.push(value);
    return months;
  }, []);

const prependZero = (value: number): string =>
  value < 10 ? `0${value}` : `${value}`;

/**
 * Formats a date "YYYY-MM-DD on HH:mm:ss" style.
 * @param date The date to format
 */
export const dateToString = (date: Date) =>
  `${date.getFullYear()}-${prependZero(date.getMonth() + 1)}-${prependZero(
    date.getDate(),
  )} at ${prependZero(date.getHours())}:${prependZero(
    date.getMinutes(),
  )}:${prependZero(date.getSeconds())}`;

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
  user.confirmationExpiresAt != null &&
  user.confirmationExpiresAt.getTime() <= Date.now();
