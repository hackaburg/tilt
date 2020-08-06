import * as React from "react";

const LazyLoadedStatistics = React.lazy(async () => {
  const { Statistics } = await import("./statistics");
  return {
    default: Statistics,
  };
});

/**
 * Lazy-loaded statistics, since only moderators need to see this.
 */
export const LazyStatistics = () => <LazyLoadedStatistics />;
