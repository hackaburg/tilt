/**
 * Async equivalent of a sleep/wait call.
 * @param ms The duration to sleep
 */
export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
