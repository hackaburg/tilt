import styled from "@emotion/styled";
import * as React from "react";

const InnerCenteredContainer = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;
const OuterCenteredContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;

interface ICenteredProps {
  children: React.ReactChild;
}

/**
 * Centers the contents in the parent container.
 */
export const CenteredContainer = ({ children }: ICenteredProps) => (
  <OuterCenteredContainer>
    <InnerCenteredContainer>{children}</InnerCenteredContainer>
  </OuterCenteredContainer>
);

/**
 * A page sized container.
 */
export const PageSizedContainer = styled.div`
  width: 100vw;
  height: 100vh;
  overflow: auto;
`;

/**
 * A container with 100vh.
 */
export const PageHeightContainer = styled.div`
  height: 100vh;
`;
