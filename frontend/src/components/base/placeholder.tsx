import { keyframes } from "@emotion/core";
import styled from "@emotion/styled";
import * as React from "react";
import { shimmerBackgroundColor, shimmerColor } from "../../config";
import { StyleableFlexContainer } from "./flex";

const ShimmerKeyframes = keyframes`
  from {
      left: -100%;
  }

  to {
      left: 100%;
  }
`;

const PlaceholderContainer = styled(StyleableFlexContainer)`
  position: relative;
  display: block;
  width: 100%;

  overflow: hidden;
  background-color: ${shimmerBackgroundColor};
  border-radius: 3px;

  &::after {
    content: " ";
    display: block;
    width: 100%;
    height: 100%;

    position: absolute;
    top: 0%;
    left: 0%;

    animation: ${ShimmerKeyframes} 2s linear infinite;

    background: linear-gradient(
      to right,
      ${shimmerBackgroundColor} 10%,
      ${shimmerColor} 40%,
      ${shimmerColor} 60%,
      ${shimmerBackgroundColor} 90%
    );
    background-size: 100% 200%;
  }
`;

interface IPlaceholderProps {
  height: string;
}

/**
 * A placeholder component, which can be displayed while content is loading.
 */
export const Placeholder = ({ height }: IPlaceholderProps) => (
  <PlaceholderContainer style={{ height }} />
);
