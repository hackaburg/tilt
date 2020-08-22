import * as React from "react";
import { SuspenseFallback } from "../base/suspense-fallback";

const LazyLoadedSystem = React.lazy(async () => {
  const { System } = await import("./system");
  return {
    default: System,
  };
});

/**
 * Lazy loaded system, only root needs this.
 */
export const LazySystem = () => (
  <React.Suspense fallback={<SuspenseFallback />}>
    <LazyLoadedSystem />
  </React.Suspense>
);
