import { v4 as uuid } from "node-uuid";
import { useRef } from "react";

/**
 * Generates a unique id.
 */
export const useUniqueID = () => {
  const { current: id } = useRef(uuid());
  return id;
};

/**
 * Generates an array of unique ids.
 * @param count The amount of ids to generate
 */
export const useUniqueIDs = (count: number) => {
  const idArray = new Array(count).fill(0).map(() => uuid());
  const { current: ids } = useRef(idArray);

  return ids;
};
