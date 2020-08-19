import styled from "@emotion/styled";
import * as React from "react";
import { borderRadius, transitionDuration } from "../../config";
import { StyleableFlexContainer } from "./flex";

const ElevatedContainer = styled(StyleableFlexContainer)`
  border-radius: ${borderRadius};
  border: 1px solid #eee;
  transition-property: box-shadow;
  transition-duration: ${transitionDuration};
  background-color: white;
  overflow: hidden;
`;

interface IElevatedProps {
  children: React.ReactNode;
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
  >
    {children}
  </ElevatedContainer>
);
