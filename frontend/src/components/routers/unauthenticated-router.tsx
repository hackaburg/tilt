import styled from "@emotion/styled";
import * as React from "react";
import { Route, Switch } from "react-router";
import { useSettingsContext } from "../../contexts/settings-context";
import { Routes } from "../../routes";
import { Elevated } from "../base/elevated";
import {
  CenteredContainer,
  PageSizedContainer,
  StyleableFlexContainer,
} from "../base/flex";
import { LoginSignupForm } from "../pages/login-signup-form";
import { SignupDone } from "../pages/signup-done";
import { RoutedVerifyEmail } from "../pages/verify-email";

const BackgroundContainer = styled(StyleableFlexContainer)`
  overflow-y: auto;
  background-repeat: repeat-x repeat-y;
  width: 100%;
  height: 100%;
`;

const RouterContainer = styled(Elevated)`
  padding: 1rem;
  width: min(320px, 100vw);
`;

/**
 * A router for unauthenticated users.
 */
export const UnauthenticatedRouter = () => {
  const { settings } = useSettingsContext();
  const imageURL = settings.frontend.loginSignupImage;
  const backgroundImage = !imageURL ? undefined : `url(${imageURL})`;

  return (
    <PageSizedContainer>
      <BackgroundContainer
        style={{
          backgroundImage,
        }}
      >
        <CenteredContainer>
          <RouterContainer level={1}>
            <Switch>
              <Route path={Routes.Login} component={LoginSignupForm} />
              <Route path={Routes.SignupDone} component={SignupDone} />
              <Route path={Routes.VerifyEmail} component={RoutedVerifyEmail} />
            </Switch>
          </RouterContainer>
        </CenteredContainer>
      </BackgroundContainer>
    </PageSizedContainer>
  );
};
