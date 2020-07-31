import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";

/**
 * Derives mutable state from the given function. This can be used to, e.g., map
 * props to state in a safer manner than just passing it to `useState`. Changed
 * props, in this example, will take precedence over the locally mutated state.
 * @param deriveFn A function to derive state
 * @param deps Dependencies for the derive function
 */
export const useDerivedState = <T>(
  deriveFn: () => T,
  deps?: readonly any[],
): [T, Dispatch<SetStateAction<T>>] => {
  const derivedState = useMemo(deriveFn, deps);
  const [state, setState] = useState(derivedState);

  useEffect(() => {
    setState(derivedState);
  }, [derivedState]);

  return [state, setState];
};
