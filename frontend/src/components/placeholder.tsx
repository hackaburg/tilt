import styled, { keyframes } from "styled-components";
import { shimmerBackgroundColor, shimmerColor } from "../config";

const ShimmerKeyframes = keyframes`
  from {
      left: -100%;
  }

  to {
      left: 100%;
  }
`;

interface IPlaceholderProps {
  width: string;
  height: string;
}

/**
 * A placeholder components, which can be displayed while content is loading.
 */
export const Placeholder = styled.div<IPlaceholderProps>`
  position: relative;

  display: block;
  ${(props) => `
    width: ${props.width};
    height: ${props.height};
  `};

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
