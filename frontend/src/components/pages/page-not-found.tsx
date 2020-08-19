import styled from "@emotion/styled";
import * as React from "react";
import { CenteredContainer, StyleableFlexContainer } from "../base/flex";
import { Heading } from "../base/headings";
import { Text } from "../base/text";
import { Page } from "../pages/page";

const Container = styled(StyleableFlexContainer)`
  color: #555;
`;

/**
 * 404.
 */
export const PageNotFound = () => (
  <Page>
    <CenteredContainer>
      <Container>
        <Heading>Oops, that link didn't work.</Heading>
        <CenteredContainer>
          <Text>Try selecting a page from the sidebar</Text>
        </CenteredContainer>
      </Container>
    </CenteredContainer>
  </Page>
);
