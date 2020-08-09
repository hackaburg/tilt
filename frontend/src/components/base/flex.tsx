import * as React from "react";
import FlexView from "react-flexview";
import { spacerSize } from "../../config";

/**
 * A flex container with `spacerSize` width.
 */
export const HorizontalSpacer = () => (
  <FlexView width={spacerSize} shrink={false} />
);

/**
 * A flex container with `spacerSize` height.
 */
export const VerticalSpacer = () => (
  <FlexView height={spacerSize} shrink={false} />
);
