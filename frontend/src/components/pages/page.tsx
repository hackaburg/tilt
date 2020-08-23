import styled from "@emotion/styled";
import * as React from "react";
import { StyleableFlexContainer } from "../base/flex";

const PaddedContainer = styled(StyleableFlexContainer)`
  padding: 2rem;
  height: 100%;
`;

interface IPageContainerProps {
  children: React.ReactNode;
}

/**
 * A container to wrap pages.
 */
export const Page = ({ children }: IPageContainerProps) => (
  <PaddedContainer>{children}</PaddedContainer>
);
