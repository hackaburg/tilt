import * as React from "react";
import { FlexColumnContainer } from "./flex";
import { Spinner } from "./spinner";

/**
 * A loading spinner to use as a Suspense fallback.
 */
export const SuspenseFallback = () => (
  <FlexColumnContainer>
    <Spinner size={50} text="Loading" />
  </FlexColumnContainer>
);
