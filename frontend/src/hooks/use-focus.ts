import { useCallback, useState } from "react";

type ISetFocus = () => void;
type IResetFocus = () => void;

/**
 * A hook to manage focus state via a focus and blur function.
 */
export const useFocus = (): [boolean, ISetFocus, IResetFocus] => {
  const [isFocused, setIsFocused] = useState(false);
  const setFocus = useCallback(() => setIsFocused(true), []);
  const resetFocus = useCallback(() => setIsFocused(false), []);
  return [isFocused, setFocus, resetFocus];
};
