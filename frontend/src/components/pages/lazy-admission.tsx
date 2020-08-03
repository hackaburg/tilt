import * as React from "react";
import { SuspenseFallback } from "../base/suspense-fallback";

const LazyLoadedAdmissionCenter = React.lazy(async () => {
  const { Admission } = await import("./admission");
  return {
    default: Admission,
  };
});

/**
 * Lazy loaded admission center, since only moderators need this.
 */
export const LazyAdmission = () => (
  <React.Suspense fallback={<SuspenseFallback />}>
    <LazyLoadedAdmissionCenter />
  </React.Suspense>
);
