import styled from "@emotion/styled";
import * as React from "react";

const CardContainer = styled.span`
  border-radius: 1rem;
  box-shadow: rgba(0, 0, 0, 0.16) 0px 10px 36px 0px,
    rgba(0, 0, 0, 0.06) 0px 0px 0px 1px;
  padding: 2rem;
  padding-top: 1rem;
  margin-top: 2rem;
`;

interface ICodeProps {
  children: React.ReactNode;
}

/**
 * A form field.
 */
export const SimpleCard = ({ children }: ICodeProps) => (
  <CardContainer>{children}</CardContainer>
);
