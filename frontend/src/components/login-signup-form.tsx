import * as React from "react";
import { useState } from "react";
import styled from "styled-components";
import { transitionDuration } from "../config";
import { InnerCenteredContainer, OuterCenteredContainer } from "./centering";
import { LoginForm } from "./login-form";
import { ConnectedSignupForm } from "./signup-form";

/**
 * Represents the different variations of the login and signup form.
 */
enum DisplayState {
  LoginForm = "login",
  SignupForm = "signup",
}

const FullSizeContainer = styled.div`
  width: 100vw;
  height: 100vh;
  overflow: auto;
`;

const PageContainer = styled.div`
  &::after {
    content: " ";
    display: table;
    clear: both;
  }
`;

interface IPageProps {
  shown: boolean;
  direction: "left" | "right";
}

const Page = styled.div<IPageProps>`
  float: left;
  transition-property: opacity, margin-${(props) => props.direction};
  transition-duration: ${transitionDuration};
  transition-timing-function: ease-out;

  ${(props) =>
    props.shown
      ? `
        opacity: 1;
        margin-${props.direction}: 0;
      `
      : `
        opacity: 0;
        margin-${props.direction}: -100%;
      `
  }
`;

/**
 * A login and signup form.
 */
export const LoginSignupForm = () => {
  const [displayState, setDisplayState] = useState(DisplayState.SignupForm);

  return (
    <FullSizeContainer>
      <OuterCenteredContainer>
        <InnerCenteredContainer>
          <PageContainer>
            <Page shown={displayState === DisplayState.SignupForm} direction="left">
              <ConnectedSignupForm onOpenLogin={() => setDisplayState(DisplayState.LoginForm)} />
            </Page>

            <Page shown={displayState === DisplayState.LoginForm} direction="right">
              <LoginForm />
            </Page>
          </PageContainer>
        </InnerCenteredContainer>
      </OuterCenteredContainer>
    </FullSizeContainer>
  );
};
