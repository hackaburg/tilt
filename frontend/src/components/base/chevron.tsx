import styled from "@emotion/styled";
import * as React from "react";
import { transitionDuration } from "../../config";

const SVG = styled.svg`
  transition-property: transform;
  transition-duration: ${transitionDuration};
`;

interface IChevronProps {
  color?: string;
  size?: number;
  rotation?: number;
}

/**
 * An arrow without the middle line.
 */
export const Chevron = ({
  color = "black",
  size = 20,
  rotation = 0,
}: IChevronProps) => {
  const boxWidth = 500;
  const boxHeight = 200;
  const centerX = boxWidth / 2;

  return (
    <SVG
      width={size}
      height={size}
      viewBox={`0 0 ${boxWidth} ${boxHeight}`}
      style={{
        transform: `rotate(${rotation}deg)`,
      }}
    >
      <path
        d={`M 0, 0 L ${centerX}, ${boxHeight} L ${boxWidth}, 0`}
        fill="transparent"
        stroke={color}
        strokeWidth={30}
      />
    </SVG>
  );
};
