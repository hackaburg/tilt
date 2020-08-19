import { useEffect, useMemo, useState } from "react";

/**
 * Matches the given media query.
 * @param query A media query to match
 */
export const useMediaQuery = (query: string): boolean => {
  const media = useMemo(() => window.matchMedia(query), [query]);
  const [isMatch, setIsMatch] = useState(() => media.matches);

  useEffect(() => {
    const handler = () => {
      setIsMatch(media.matches);
    };

    media.addListener(handler);

    return () => media.removeListener(handler);
  }, [media]);

  return isMatch;
};
