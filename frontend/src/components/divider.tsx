import styled from "@emotion/styled";
import * as React from "react";
import FlexView from "react-flexview";

const spacer = <FlexView height="0.5rem" />;
const Border = styled(FlexView)`
  border-top: 1px dashed #ccc;
`;

/**
 * A vertical divider.
 */
export const Divider = () => (
  <FlexView column shrink={false}>
    {spacer}
    <Border />
    {spacer}
  </FlexView>
);
