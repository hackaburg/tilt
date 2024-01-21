import styled from "@emotion/styled";
import * as React from "react";
import { Divider } from "../base/divider";
import { StyleableFlexContainer } from "../base/flex";
import { Heading } from "../base/headings";
import { Page } from "./page";

const HeaderContainer = styled(StyleableFlexContainer)`
  justify-content: space-between;
  flex-direction: row;
`;

/**
 * A settings dashboard to configure all parts of tilt.
 */
export const Map = () => (
  <Page>
    <HeaderContainer>
      <Heading text="Map" />
    </HeaderContainer>
    <Divider />
    <div style={{ marginTop: "5rem" }}> Will come soon ...</div>
  </Page>
);
