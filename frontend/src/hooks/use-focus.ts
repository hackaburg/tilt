import { useCallback, useState } from "react";

type ISetFocus = () => void;
type IResetFocus = () => void;

/**
 * A hook to manage focus state via a focus and blur function.
 * @param initialFocusState The initial focus state
 */
export const useFocus = (
  initialFocusState: boolean,
): [boolean, ISetFocus, IResetFocus] => {
  const [isFocused, setIsFocused] = useState(initialFocusState);
  const setFocus = useCallback(() => setIsFocused(true), []);
  const resetFocus = useCallback(() => setIsFocused(false), []);
  return [isFocused, setFocus, resetFocus];
};
