import { useContext } from "react";
import { Nullable } from "../state";

/**
 * Safely accesses a potentially empty context, throwing an error if there's no value.
 * @param context The context to access
 */
export const useContextOrThrow = <T>(
  context: React.Context<Nullable<T>>,
): T => {
  const value = useContext(context);

  if (value == null) {
    throw new Error(`${context.displayName ?? "Context"}.Provider is empty.`);
  }

  return value;
};
