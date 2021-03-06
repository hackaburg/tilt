import styled from "@emotion/styled";
import * as React from "react";
import { useCallback, useState } from "react";
import { Redirect } from "react-router";
import { useLoginContext } from "../../contexts/login-context";
import { useApi } from "../../hooks/use-api";
import { Routes } from "../../routes";
import { Button } from "../base/button";
import {
  CenteredContainer,
  FlexColumnContainer,
  StyleableFlexContainer,
} from "../base/flex";
import { Heading } from "../base/headings";
import { Message } from "../base/message";
import { Text } from "../base/text";
import { TextInput, TextInputType } from "../base/text-input";

const ButtonContainer = styled(StyleableFlexContainer)`
  padding-top: 1rem;
`;

/**
 * A form to create an account.
 */
export const LoginSignupForm = () => {
  const { updateUser } = useLoginContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const {
    isFetching: loginInProgress,
    error: loginError,
    forcePerformRequest: sendLoginRequest,
  } = useApi(
    async (api, wasTriggeredManually) => {
      if (wasTriggeredManually) {
        const user = await api.login(email, password);
        updateUser(() => user);
      }
    },
    [email, password, updateUser],
  );

  const {
    value: didSignup,
    isFetching: signupInProgress,
    error: signupError,
    forcePerformRequest: sendSignupRequest,
  } = useApi(
    async (api, wasTriggeredManually) => {
      if (wasTriggeredManually) {
        await api.signup(email, password);
        return true;
      }

      return false;
    },
    [email, password],
  );

  const formInProgress = signupInProgress || loginInProgress;
  const signupDone = Boolean(didSignup) && !signupInProgress && !signupError;

  const handleSubmit = useCallback((event: React.SyntheticEvent) => {
    event.preventDefault();
  }, []);

  if (signupDone) {
    return <Redirect to={Routes.SignupDone} />;
  }

  return (
    <FlexColumnContainer>
      <Heading text="Register to apply" />

      {loginError && (
        <Message error>
          <b>Login error:</b> {loginError.message}
        </Message>
      )}

      {signupError && (
        <Message error>
          <b>Signup error:</b> {signupError.message}
        </Message>
      )}

      <form onSubmit={handleSubmit}>
        <TextInput
          title="E-Mail"
          placeholder="me@foo.bar"
          value={email}
          onChange={(value) => setEmail(value)}
          type={TextInputType.Email}
          name="username"
          autoFocus
          autoCompleteField="username"
        />

        <TextInput
          title="Password"
          placeholder="please don't use 'password'"
          value={password}
          onChange={(value) => setPassword(value)}
          type={TextInputType.Password}
          name="password"
          autoCompleteField="current-password"
        />

        <ButtonContainer>
          <Button
            onClick={sendLoginRequest}
            loading={loginInProgress}
            disable={formInProgress}
            primary
          >
            Let me in
          </Button>

          <CenteredContainer>
            <Text>Don't have an account?</Text>
          </CenteredContainer>

          <Button
            onClick={sendSignupRequest}
            loading={signupInProgress}
            disable={formInProgress}
          >
            Create my account
          </Button>
        </ButtonContainer>
      </form>
    </FlexColumnContainer>
  );
};
