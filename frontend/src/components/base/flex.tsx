import styled from "@emotion/styled";
import * as React from "react";
import { mediaBreakpoints, spacerSize } from "../../config";

interface IFlexContainerProps {
  children?: React.ReactNode;
}

const SpacerDiv = styled.div`
  display: flex;
  flex: 0 0 auto;
  width: ${spacerSize};
  height: ${spacerSize};
`;

/**
 * A spacer with `spacerSize` width and height. Works for both rows and columns.
 */
export const Spacer = () => <SpacerDiv />;

/**
 * A flex column container.
 */
export const FlexColumnContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  flex-shrink: 0;
  flex-basis: auto;
`;

/**
 * A flex row container.
 */
export const FlexRowContainer = styled.div`
  display: flex;
  flex-grow: 1;
  flex-shrink: 0;
  flex-basis: auto;

  @media screen and (max-width: ${mediaBreakpoints.tablet}) {
    flex-direction: column;
  }
`;

/**
 * A column in a flex row.
 */
export const FlexRowColumnContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  flex-shrink: 0;
  flex-basis: 0;
  padding: 0.5rem;

  @media screen and (max-width: ${mediaBreakpoints.tablet}) {
    flex: 0 1 auto !important;
  }
`;

/**
 * A column in a flex row.
 */
export const BigFlexRowColumnContainer = (props: {
  children?: React.ReactNode;
  style?: React.CSSProperties;
}) => (
  <FlexRowColumnContainer {...props} style={{ ...props.style, flexGrow: 2 }}>
    {props.children}
  </FlexRowColumnContainer>
);

/**
 * A flex container that doesn't grow to its parent's size.
 */
export const NonGrowingFlexContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 0 0 auto;
`;

/**
 * A vertically scrollable flex container.
 */
export const VerticalScrollFlexContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1 0 auto;
  width: 100%;
  overflow-y: auto;
`;

const PageSizedContainerDiv = styled.div`
  display: flex;
  height: 100vh;
`;

/**
 * A page sized container.
 */
export const PageSizedContainer = ({ children }: IFlexContainerProps) => (
  <PageSizedContainerDiv>
    <VerticalScrollFlexContainer>{children}</VerticalScrollFlexContainer>
  </PageSizedContainerDiv>
);

/**
 * A container fully centering its children.
 */
export const CenteredContainer = styled.div`
  display: flex;
  flex: 1 0 auto;
  justify-content: center;
  align-items: center;
  flex-direction: inherit;
`;

/**
 * A container which vertically centers its children.
 */
export const VerticallyCenteredContainer = styled.div`
  display: flex;
  flex: 1 0 auto;
  align-items: center;
`;
