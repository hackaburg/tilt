import * as React from "react";
import { Spinner } from "./spinner";

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
  <React.Suspense fallback={<Spinner />}>
    <LazyLoadedAdmissionCenter />
  </React.Suspense>
);
