import * as React from "react";
import { SuspenseFallback } from "../base/suspense-fallback";

const LazyLoadedAdmissionCenter = React.lazy(async () => {
  const { AdmissionCenter } = await import("./admission-center");
  return {
    default: AdmissionCenter,
  };
});

/**
 * Lazy loaded admission center, since only moderators need this.
 */
export const LazyAdmissionCenter = () => (
  <React.Suspense fallback={<SuspenseFallback />}>
    <LazyLoadedAdmissionCenter />
  </React.Suspense>
);
