import styled from "@emotion/styled";
import * as React from "react";
import FlexView from "react-flexview";
import { Route, Switch } from "react-router";
import { useSettingsContext } from "../contexts/settings-context";
import { Routes } from "../routes";
import { Elevated } from "./elevated";
import { LoginSignupForm } from "./login-signup-form";
import { RoutedVerifyEmail } from "./verify-email";

const BackgroundContainer = styled(FlexView)`
  overflow-y: auto;
  background-repeat: repeat-x repeat-y;
`;

const RouterContainer = styled(Elevated)`
  padding: 1rem;
`;

/**
 * A router for unauthenticated users.
 */
export const UnauthenticatedRouter = () => {
  const { settings } = useSettingsContext();
  const imageURL = settings.frontend.loginSignupImage;
  const backgroundImage = !imageURL ? undefined : `url(${imageURL})`;

  return (
    <BackgroundContainer
      height="100vh"
      hAlignContent="center"
      vAlignContent="center"
      style={{
        backgroundImage,
      }}
    >
      <FlexView width="min(300px, 100vh)" column>
        <RouterContainer level={1}>
          <Switch>
            <Route path={Routes.Login} component={LoginSignupForm} />
            <Route path={Routes.VerifyEmail} component={RoutedVerifyEmail} />
          </Switch>
        </RouterContainer>
      </FlexView>
    </BackgroundContainer>
  );
};
