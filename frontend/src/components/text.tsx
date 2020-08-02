import styled from "@emotion/styled";
import * as React from "react";

const P = styled.p`
  margin: 0;
  padding: 0.5rem 0;
`;

interface ITextProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Renders text.
 */
export const Text = ({ children, className }: ITextProps) => (
  <P className={className}>{children}</P>
);
