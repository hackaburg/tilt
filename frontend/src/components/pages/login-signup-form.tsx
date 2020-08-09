import styled from "@emotion/styled";
import * as React from "react";
import { useCallback, useState } from "react";
import FlexView from "react-flexview";
import { useLoginContext } from "../../contexts/login-context";
import { useApi } from "../../hooks/use-api";
import { Button } from "../base/button";
import { Heading } from "../base/headings";
import { Message } from "../base/message";
import { Text } from "../base/text";
import { TextInput, TextInputType } from "../base/text-input";

const ButtonContainer = styled(FlexView)`
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
    return (
      <FlexView column grow>
        <Heading>Done.</Heading>
        <Text>We've sent you an email with a button to verify yourself.</Text>
        <Text>
          It might take a minute or two to arrive, and to be safe, please also
          check your junk mail.
        </Text>
      </FlexView>
    );
  }

  return (
    <FlexView column grow>
      <Heading>Register to apply</Heading>

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
          autoFocus
        />

        <TextInput
          title="Password"
          placeholder="please don't use 'password'"
          value={password}
          onChange={(value) => setPassword(value)}
          type={TextInputType.Password}
        />

        <ButtonContainer column grow hAlignContent="center">
          <Button
            onClick={sendLoginRequest}
            loading={loginInProgress}
            disable={formInProgress}
            primary
          >
            Let me in
          </Button>

          <Text>Don't have an account?</Text>

          <Button
            onClick={sendSignupRequest}
            loading={signupInProgress}
            disable={formInProgress}
          >
            Create my account
          </Button>
        </ButtonContainer>
      </form>
    </FlexView>
  );
};
