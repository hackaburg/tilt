import { useRef } from "react";
import { randomFortune } from "../fortunes";

/**
 * Gets a random, but consistent fortune.
 */
export const useFortune = () => {
  const { current: fortune } = useRef(randomFortune());
  return fortune;
};
