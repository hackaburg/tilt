import * as React from "react";
import { useCallback, useState } from "react";
import styled from "styled-components";
import { useLoginContext } from "../contexts/login-context";
import { useApi } from "../hooks/use-api";
import { BlurContainer } from "./blur-container";
import { Button } from "./button";
import { CenteredContainer, PageSizedContainer } from "./centering";
import { FadeContainer } from "./fade-container";
import { Heading } from "./headings";
import { ConnectedLoginImage } from "./login-image";
import { Message } from "./message";
import { TextInput, TextInputType } from "./text-input";

const Container = styled.div`
  margin: 2rem 0rem;
  width: 300px;
  max-height: 100vh;
`;

const SignupDoneMessage = styled(FadeContainer)`
  position: absolute;
`;

const FormContainer = styled.form`
  margin: 2rem 0rem;
`;

const Fields = styled.div`
  margin-bottom: 3rem;
  color: #aaa;
`;

const Divider = styled.p`
  padding: 1rem 0rem;
  text-align: center;
`;

/**
 * A form to create an account.
 */
export const LoginSignupForm = () => {
  const { login } = useLoginContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [, loginInProgress, loginError, sendLoginRequest] = useApi(
    async (api, wasTriggeredManually) => {
      if (wasTriggeredManually) {
        const role = await api.login(email, password);
        login(role);
      }
    },
    [email, password, login],
  );

  const [didSignup, signupInProgress, signupError, sendSignupRequest] = useApi(
    async (api, wasTriggeredManually) => {
      if (wasTriggeredManually) {
        await api.signup(email, password);
        return true;
      }
    },
    [email, password],
  );

  const formInProgress = signupInProgress || loginInProgress;
  const error = loginError ?? signupError;
  const signupDone = !!didSignup && !signupInProgress && !error;

  const onSubmit = useCallback(
    async (event: React.SyntheticEvent) => {
      event.preventDefault();
      await sendLoginRequest();
    },
    [sendLoginRequest],
  );

  return (
    <PageSizedContainer>
      <CenteredContainer>
        <Container>
          <ConnectedLoginImage />

          <SignupDoneMessage show={signupDone}>
            <Heading>Done.</Heading>
            <p>We've sent you an email with a button to verify yourself.</p>
            <p>
              It might take a minute or two to arrive, and to be safe, please
              also check your junk mail.
            </p>
          </SignupDoneMessage>

          <BlurContainer blur={signupDone}>
            {!error && (
              <>
                <Heading>Apply</Heading>
                <p>Create an account or login.</p>
              </>
            )}

            {error && (
              <Message error>
                <b>Error:</b> {error?.message}
              </Message>
            )}

            <FormContainer onSubmit={onSubmit}>
              <Fields>
                <TextInput
                  title="E-Mail"
                  placeholder="me@foo.bar"
                  value={email}
                  onChange={(value) => setEmail(value)}
                  focus
                />

                <TextInput
                  title="Password"
                  placeholder="please don't use 'password'"
                  value={password}
                  onChange={(value) => setPassword(value)}
                  type={TextInputType.Password}
                />
              </Fields>

              <Button
                onClick={sendSignupRequest}
                loading={signupInProgress}
                disable={formInProgress}
                primary
                fluid
              >
                Create my account
              </Button>
              <Divider>Already have an account?</Divider>
              <Button
                onClick={sendLoginRequest}
                loading={loginInProgress}
                disable={formInProgress}
                fluid
              >
                Let me in
              </Button>
            </FormContainer>
          </BlurContainer>
        </Container>
      </CenteredContainer>
    </PageSizedContainer>
  );
};
