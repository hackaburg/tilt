import styled from "@emotion/styled";
import * as React from "react";
import { Divider } from "../base/divider";
import { StyleableFlexContainer } from "../base/flex";
import { Heading } from "../base/headings";
import { ApplicationSettings } from "../settings/application-settings";
import { EmailSettings } from "../settings/email-settings";
import { FrontendSettings } from "../settings/frontend-settings";
import { SettingsSaveButton } from "../settings/save-button";
import { Page } from "./page";

const HeaderContainer = styled(StyleableFlexContainer)`
  justify-content: space-between;
  flex-direction: row;
`;

const ButtonContainer = styled(StyleableFlexContainer)`
  flex-basis: 0;
`;

/**
 * A settings dashboard to configure all parts of tilt.
 */
export const Settings = () => (
  <Page>
    <HeaderContainer>
      <Heading text="Settings" />
      <ButtonContainer>
        <SettingsSaveButton />
      </ButtonContainer>
    </HeaderContainer>
    <Divider />
    <FrontendSettings />
    <Divider />
    <ApplicationSettings />
    <Divider />
    <EmailSettings />
  </Page>
);
