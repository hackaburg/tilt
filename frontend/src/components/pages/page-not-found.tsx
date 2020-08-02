import styled from "@emotion/styled";
import * as React from "react";
import FlexView from "react-flexview";
import { Heading } from "../base/headings";
import { Text } from "../base/text";
import { Page } from "../pages/page";

const Container = styled(FlexView)`
  text-align: center;
  color: #555;
`;

/**
 * 404.
 */
export const PageNotFound = () => (
  <Page>
    <FlexView hAlignContent="center" vAlignContent="center" grow>
      <Container column>
        <Heading>Oops, that link didn't work.</Heading>
        <Text>Try selecting a page from the sidebar</Text>
      </Container>
    </FlexView>
  </Page>
);
