import * as React from "react";
import { SuspenseFallback } from "../base/suspense-fallback";

const LazyLoadedSettings = React.lazy(async () => {
  const settings = await import("../pages/settings");
  return {
    default: settings.Settings,
  };
});

/**
 * Lazy loaded settings, since only moderators need this.
 */
export const LazySettings = () => (
  <React.Suspense fallback={<SuspenseFallback />}>
    <LazyLoadedSettings />
  </React.Suspense>
);
