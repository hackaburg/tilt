import * as React from "react";
import { SuspenseFallback } from "../base/suspense-fallback";

const LazyLoadedAuthenticatedRouter = React.lazy(async () => {
  const { AuthenticatedRouter } = await import("./authenticated-router");

  return {
    default: AuthenticatedRouter,
  };
});

/**
 * Lazy loaded authenticated router.
 */
export const LazyAuthenticatedRouter = () => (
  <React.Suspense fallback={<SuspenseFallback />}>
    <LazyLoadedAuthenticatedRouter />
  </React.Suspense>
);
