import { useRef } from "react";
import { Nullable } from "../util";

let counter = 0;

// it's safe to assume this won't overflow
const incrementAndGetCounter = () => ++counter;

const generateUniqueID = () => `unique-id-${incrementAndGetCounter()}`;

/**
 * Generates a unique id.
 */
export const useUniqueID = (): string => {
  const ref = useRef<Nullable<string>>(null);

  if (ref.current == null) {
    ref.current = generateUniqueID();
  }

  return ref.current as string;
};

/**
 * Generates an array of unique ids.
 * @param count The amount of ids to generate
 */
export const useUniqueIDs = (count: number): readonly string[] => {
  const ref = useRef<Nullable<readonly string[]>>(null);

  if (ref.current == null) {
    ref.current = new Array(count).fill(0).map(() => generateUniqueID());
  }

  return ref.current as readonly string[];
};
