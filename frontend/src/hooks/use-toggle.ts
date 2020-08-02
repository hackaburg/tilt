import { useCallback, useState } from "react";

/**
 * A toggleable state.
 * @param initialValue The initial toggle value
 */
export const useToggle = (initialValue: boolean): [boolean, () => void] => {
  const [state, setState] = useState(initialValue);
  const toggle = useCallback(() => {
    setState((value) => !value);
  }, []);

  return [state, toggle];
};
