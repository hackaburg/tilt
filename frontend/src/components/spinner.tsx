import * as React from "react";
import { ScaleLoader } from "react-spinners";

/**
 * A spinner indicating a loading state.
 */
export const Spinner = () => (
  <ScaleLoader
    height={1}
    heightUnit="rem"
    color="currentColor"
    css={
      {
        display: "inline-block",
        margin: "auto",
        padding: "1rem 0rem",
      } as any
    }
  />
);
