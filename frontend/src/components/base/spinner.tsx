import * as React from "react";
import { CenteredContainer, NonGrowingFlexContainer } from "./flex";

interface ISpinnerProps {
  color?: string;
  radius?: number;
  size?: number;
  text?: string;
  width?: number;
}

/**
 * A spinner indicating a loading state.
 */
export const Spinner = ({
  text,
  color = "black",
  size = 100,
  radius = 0.4,
  width = 0.075,
}: ISpinnerProps) => {
  const boxSize = 100;
  const center = boxSize / 2;

  return (
    <CenteredContainer>
      <NonGrowingFlexContainer>
        <svg width={size} height={size} viewBox={`0 0 ${boxSize} ${boxSize}`}>
          <defs>
            <linearGradient id="gradient" x1="10%" y1="50%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="100%" stopColor={color} />
            </linearGradient>

            <clipPath id="cut-edge">
              <rect x={0} y={0} width={boxSize} height={center} />
            </clipPath>
          </defs>

          <circle
            cx={center}
            cy={center}
            r={boxSize * radius}
            stroke="url(#gradient)"
            strokeWidth={boxSize * width}
            fill="transparent"
            clipPath="url(#cut-edge)"
          >
            <animateTransform
              attributeType="xml"
              attributeName="transform"
              type="rotate"
              from={`0 ${center} ${center}`}
              to={`360 ${center} ${center}`}
              dur="1s"
              additive="sum"
              repeatCount="indefinite"
            />
          </circle>
        </svg>

        {text}
      </NonGrowingFlexContainer>
    </CenteredContainer>
  );
};
