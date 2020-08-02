import * as React from "react";
import { Spinner } from "./spinner";

/**
 * A loading spinner to use as a Suspense fallback.
 */
export const SuspenseFallback = () => <Spinner size={50} text="Loading" />;
