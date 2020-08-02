import * as React from "react";
import { Spinner } from "../base/spinner";

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
  <React.Suspense fallback={<Spinner />}>
    <LazyLoadedAuthenticatedRouter />
  </React.Suspense>
);
