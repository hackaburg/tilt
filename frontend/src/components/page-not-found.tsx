import * as React from "react";
import styled from "styled-components";
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
