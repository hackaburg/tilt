import * as React from "react";
import { FlexColumnContainer, Spacer, StyleableFlexContainer } from "./flex";
import styled from "@emotion/styled";

const Border = styled(StyleableFlexContainer)`
  border-top: 1px dashed #ccc;
`;
/**
 * A vertical divider.
 */
export const Divider = () => (
  <hr
    style={{
      width: "3rem",
      marginLeft: "0",
      height: "5px",
      color: "black",
      backgroundColor: "black",
    }}
  ></hr>
);

/**
 * A vertical divider slim.
 */
export const DividerSlim = () => (
  <FlexColumnContainer>
    <Spacer />
    <Border />
    <Spacer />
  </FlexColumnContainer>
);
