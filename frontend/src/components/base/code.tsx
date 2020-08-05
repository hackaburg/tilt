import styled from "@emotion/styled";
import * as React from "react";
import { borderRadius } from "../../config";

const Span = styled.span`
  padding: 0.1rem 0.2rem;
  font-family: Monaco, Consolas, Inconsolata, monospace;
  font-size: 0.75rem;
  background-color: #f7f7f7;
  border: 1px solid #eee;
  border-radius: ${borderRadius};
`;

interface ICodeProps {
  children: React.ReactNode;
}

/**
 * A text field that looks like code. But is actually just a monospace span.
 */
export const Code = ({ children }: ICodeProps) => <Span>{children}</Span>;
