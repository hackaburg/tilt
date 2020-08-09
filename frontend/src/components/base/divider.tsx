import styled from "@emotion/styled";
import * as React from "react";
import FlexView from "react-flexview";
import { VerticalSpacer } from "./flex";

const Border = styled(FlexView)`
  border-top: 1px dashed #ccc;
`;

/**
 * A vertical divider.
 */
export const Divider = () => (
  <FlexView column shrink={false}>
    <VerticalSpacer />
    <Border />
    <VerticalSpacer />
  </FlexView>
);
