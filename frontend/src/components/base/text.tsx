import styled from "@emotion/styled";
import * as React from "react";

const P = styled.p`
  margin: 0;
`;

interface ITextProps {
  children: React.ReactNode;
  className?: string;
  style: React.CSSProperties;
}

/**
 * Renders text.
 */
export const Text = ({ children, className, style }: ITextProps) => (
  <P style={style} className={className}>
    {children}
  </P>
);
