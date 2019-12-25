import * as React from "react";
import { Spinner } from "./spinner";

const LazyLoadedSettings = React.lazy(async () => {
  const settings = await import("./settings");
  return {
    default: settings.Settings,
  };
});

/**
 * Lazy loaded settings, since only moderators need this.
 */
export const LazySettings = () => (
  <React.Suspense fallback={<Spinner />}>
    <LazyLoadedSettings />
  </React.Suspense>
);
