import styled from "@emotion/styled";
import * as React from "react";
import { CenteredContainer, PageHeightContainer } from "./centering";
import { Heading } from "./headings";

const Text = styled.div`
  text-align: center;
  color: #555;
`;

/**
 * 404.
 */
export const PageNotFound = () => (
  <PageHeightContainer>
    <CenteredContainer>
      <Text>
        <Heading>Oops, that link didn't work.</Heading>
        <p>Try selecting a page from the sidebar</p>
      </Text>
    </CenteredContainer>
  </PageHeightContainer>
);
