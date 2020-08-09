import * as React from "react";
import FlexView from "react-flexview";

interface IProps {
  children: FlexView.Props["children"];
}

/**
 * A row in a grid layout.
 */
export const Row = ({ children }: IProps) => (
  <FlexView grow>{children}</FlexView>
);

/**
 * An equally-sized column in a `Row`.
 */
export const Col = ({ children }: IProps) => (
  <FlexView column grow={1}>
    {children}
  </FlexView>
);
