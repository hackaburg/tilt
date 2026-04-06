import styled from "@emotion/styled";
import * as React from "react";
import { NonGrowingFlexContainer } from "../base/flex";

const PaddedContainer = styled(NonGrowingFlexContainer)`
  padding: 2rem;
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
