import { mediaBreakpoints } from "../config";
import { useMediaQuery } from "./use-media-query";

const query = `(max-width: ${mediaBreakpoints.tablet})`;

/**
 * Returns whether we're currently displaying responsive layout.
 */
export const useIsResponsive = (): boolean => {
  return useMediaQuery(query);
};
