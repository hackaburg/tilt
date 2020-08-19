import * as React from "react";
import { PageSizedContainer } from "../base/flex";
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
  <React.Suspense
    fallback={
      <PageSizedContainer>
        <SuspenseFallback />
      </PageSizedContainer>
    }
  >
    <LazyLoadedAuthenticatedRouter />
  </React.Suspense>
);
