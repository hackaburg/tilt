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
import { LoginForm } from "../pages/login-form";
import { RegisterForm } from "../pages/register-form";
import { ForgotPassword } from "../pages/forgot-password";
import { ResetPassword } from "../pages/reset-password";
import { SignupDone } from "../pages/signup-done";
import { RoutedVerifyEmail } from "../pages/verify-email";
import { variables } from "../../theme";
import { Button } from "@mui/material";
import { MdSupportAgent } from "react-icons/md";

const BackgroundContainer = styled(StyleableFlexContainer)`
  overflow-y: auto;
  background-repeat: repeat-x repeat-y;
  width: 100%;
  height: 100%;
`;

const RouterContainer = styled(Elevated)`
  padding: 1rem;
  width: min(390px, 100vw);
  border-top: 4px solid;
  border-color:  ${variables.colorLink};
}`;

const H1 = styled.h1`
  font-size: 2.3rem;
  margin: 0;
  padding: 0.25rem 0;
`;

const H2 = styled.h2`
  font-size: 1.6rem;
  margin: 0;
  margin-top: -0.5rem;
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
          <div style={{ marginBottom: "2rem" }}>
            <H1 style={{ color: "white" }}>HACKABURG</H1>
            <H2 style={{ color: "white" }}>CONTROL CENTER</H2>
            <p style={{ color: "white" }}>
              Apply here for the event and get all important information
              <br></br> for{" "}
              <a
                href="https://hackaburg.de"
                target="_blank"
                style={{ color: "#3fb28f" }}
              >
                {" "}
                <b>Hackaburg 2024</b>
              </a>{" "}
            </p>
          </div>

          <RouterContainer level={1}>
            <Switch>
              <Route path={Routes.Login} component={LoginForm} />
              <Route path={Routes.ForgotPassword} component={ForgotPassword} />
              <Route path={Routes.ResetPassword} component={ResetPassword} />
              <Route path={Routes.RegisterForm} component={RegisterForm} />
              <Route path={Routes.SignupDone} component={SignupDone} />
              <Route path={Routes.VerifyEmail} component={RoutedVerifyEmail} />
            </Switch>
          </RouterContainer>
          <a href="mailto:support@hackaburg.de">
            <Button
              variant="outlined"
              style={{
                color: "white",
                borderColor: "white",
                marginTop: "1rem",
                fontSize: "1rem",
                width: "100%",
              }}
              startIcon={<MdSupportAgent />}
            >
              Need help?
            </Button>
          </a>
        </CenteredContainer>
      </BackgroundContainer>
    </PageSizedContainer>
  );
};
