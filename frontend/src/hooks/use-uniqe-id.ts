import { v4 as uuid } from "node-uuid";
import { useState } from "react";

/**
 * Generates a unique id.
 */
export const useUniqueId = () => {
  const [id] = useState(uuid());
  return id;
};

/**
 * Generates an array of unique ids.
 * @param count The amount of ids to generate
 */
export const useUniqueIds = (count: number) => {
  const idArray = new Array(count).fill(0).map(() => uuid());
  const [ids] = useState(idArray);

  return ids;
};
