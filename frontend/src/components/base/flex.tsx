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

const FlexColumnContainerDiv = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  flex-shrink: 0;
  flex-basis: auto;
`;

/**
 * A flex column container.
 */
export const FlexColumnContainer = ({ children }: IFlexContainerProps) => (
  <FlexColumnContainerDiv>{children}</FlexColumnContainerDiv>
);

const FlexRowContainerDiv = styled.div`
  display: flex;
  flex-grow: 1;
  flex-shrink: 0;
  flex-basis: auto;

  @media screen and (max-width: ${mediaBreakpoints.tablet}) {
    flex-direction: column;
  }
`;

/**
 * A flex row container.
 */
export const FlexRowContainer = ({ children }: IFlexContainerProps) => (
  <FlexRowContainerDiv>{children}</FlexRowContainerDiv>
);

const FlexRowColumnContainerDiv = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  flex-shrink: 0;
  flex-basis: 0;
  overflow-x: hidden;
  white-space: normal;
  text-overflow: ellipsis;

  @media screen and (max-width: ${mediaBreakpoints.tablet}) {
    flex: 0 1 auto !important;
  }
`;

const bigStyle: React.CSSProperties = { flexGrow: 2 };
const smallStyle: React.CSSProperties = { flexGrow: 1 };

interface IFlexRowColumnContainerProps extends IFlexContainerProps {
  isBig?: boolean;
}

/**
 * A column in a flex row.
 */
export const FlexRowColumnContainer = ({
  children,
  isBig = false,
}: IFlexRowColumnContainerProps) => (
  <FlexRowColumnContainerDiv style={isBig ? bigStyle : smallStyle}>
    {children}
  </FlexRowColumnContainerDiv>
);

const NonGrowingFlexContainerDiv = styled.div`
  display: flex;
  flex-direction: column;
  flex: 0 0 auto;
`;

/**
 * A flex container that doesn't grow to its parent's size.
 */
export const NonGrowingFlexContainer = ({ children }: IFlexContainerProps) => (
  <NonGrowingFlexContainerDiv>{children}</NonGrowingFlexContainerDiv>
);

interface IStyleableFlexContainerProps extends IFlexContainerProps {
  className?: string;
  style?: React.CSSProperties;
}

/**
 * A styleable flex column container.
 */
export const StyleableFlexContainer = ({
  children,
  className,
  style,
}: IStyleableFlexContainerProps) => (
  <NonGrowingFlexContainerDiv className={className} style={style}>
    {children}
  </NonGrowingFlexContainerDiv>
);

const VerticalScrollFlexContainerDiv = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1 0 auto;
  width: 100%;
  overflow-y: auto;
`;

/**
 * A vertically scrollable flex container.
 */
export const VerticalScrollFlexContainer = ({
  children,
}: IFlexContainerProps) => (
  <VerticalScrollFlexContainerDiv>{children}</VerticalScrollFlexContainerDiv>
);

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

const CenteredContainerDiv = styled.div`
  display: flex;
  flex: 1 0 auto;
  justify-content: center;
  align-items: center;
  flex-direction: inherit;
`;

/**
 * A container fully centering its children.
 */
export const CenteredContainer = ({ children }: IFlexContainerProps) => (
  <CenteredContainerDiv>{children}</CenteredContainerDiv>
);

const VerticallyCenteredContainerDiv = styled.div`
  display: flex;
  flex: 1 0 auto;
  align-items: center;
`;

/**
 * A container which vertically centers its children.
 */
export const VerticallyCenteredContainer = ({
  children,
}: IFlexContainerProps) => (
  <VerticallyCenteredContainerDiv>{children}</VerticallyCenteredContainerDiv>
);
