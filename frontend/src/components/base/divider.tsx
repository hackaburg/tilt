import styled from "@emotion/styled";
import * as React from "react";
import { FlexColumnContainer, Spacer, StyleableFlexContainer } from "./flex";

const Border = styled(StyleableFlexContainer)`
  border-top: 1px dashed #ccc;
`;

/**
 * A vertical divider.
 */
export const Divider = () => (
  <FlexColumnContainer>
    <Spacer />
    <Border />
    <Spacer />
  </FlexColumnContainer>
);
