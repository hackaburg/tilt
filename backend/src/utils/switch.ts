/**
 * Enforces switch statements to be exhaustive.
 * @example
 * ```ts
 * switch (foo) {
 *  case Enum.Foo:
 *    return something;
 *
 *  default: enforceExhaustiveSwitch(foo);
 * }
 * ```
 * @param argument The switch's argument
 */
export const enforceExhaustiveSwitch = (argument: never) => argument;
