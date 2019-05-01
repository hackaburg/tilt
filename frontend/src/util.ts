/**
 * Async equivalent of a sleep/wait call.
 * @param ms The duration to sleep
 */
export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Gets the month name of the given date, e.g. January for "1970-01-01".
 * @param date A date to get the month from
 */
export const getMonthName = (date: Date) => date.toLocaleDateString("en", { month: "long" });

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
export const groupByMonth = <T extends ITimestamped>(data: T[]): Array<IMonthlyGroupedData<T>> => (
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
  }, [])
);

const prependZero = (value: number): string => value < 10 ? `0${value}` : `${value}`;

/**
 * Formats a date "YYYY-MM-DD on HH:mm:ss" style.
 * @param date The date to format
 */
export const dateToString = (date: Date) => (
  `${date.getFullYear()}-${prependZero(date.getMonth() + 1)}-${prependZero(date.getDate())} at ${prependZero(date.getHours())}:${prependZero(date.getMinutes())}:${prependZero(date.getSeconds())}`
);
