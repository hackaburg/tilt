import styled from "@emotion/styled";
import * as React from "react";
import FlexView from "react-flexview";
import { borderRadius, transitionDuration } from "../config";

const ElevatedContainer = styled(FlexView)`
  border-radius: ${borderRadius};
  border: 1px solid #eee;
  transition-property: box-shadow;
  transition-duration: ${transitionDuration};
  background-color: white;
`;

interface IElevatedProps {
  children: FlexView.Props["children"];
  level: number;
  className?: string;
}

/**
 * An elevated container
 */
export const Elevated = ({ children, level, className }: IElevatedProps) => (
  <ElevatedContainer
    className={className}
    style={{
      boxShadow: `0px 3px ${level * 3}px rgba(0, 0, 0, ${
        Math.pow(4, level - 1) * 0.05
      })`,
    }}
    column
    shrink={false}
  >
    {children}
  </ElevatedContainer>
);
