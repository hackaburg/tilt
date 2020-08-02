import styled from "@emotion/styled";
import * as React from "react";
import { Text } from "./text";

const FadedText = styled(Text)`
  opacity: 0.75;
`;

interface IMutedProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * A slightly less opaque text.
 */
export const Muted = ({ children, className }: IMutedProps) => (
  <FadedText className={className}>{children}</FadedText>
);
