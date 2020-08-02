import styled from "@emotion/styled";
import * as React from "react";
import FlexView from "react-flexview";

const PageContainer = styled(FlexView)`
  overflow-y: auto;
  padding: 0 1rem;
`;

interface IPageContainerProps {
  children: FlexView.Props["children"];
}

/**
 * A container to wrap pages.
 */
export const Page = ({ children }: IPageContainerProps) => (
  <PageContainer column grow>
    {children}
  </PageContainer>
);
