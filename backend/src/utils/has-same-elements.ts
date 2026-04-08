/**
 * Check if the two arrays contain the same elements, regardless of order.
 */
export function hasSameElements<T>(a: T[], b: T[]): boolean {
  return a.length === b.length && a.every((entry) => b.includes(entry));
}
