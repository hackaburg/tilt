import styled from "@emotion/styled";
import * as React from "react";
import { useCallback, useState } from "react";
import { Redirect } from "react-router";
import { useApi } from "../../hooks/use-api";
import { Routes } from "../../routes";
import { Button } from "../base/button";
import { FlexColumnContainer, StyleableFlexContainer } from "../base/flex";
import { Heading } from "../base/headings";
import { Message } from "../base/message";
import { TextInput, TextInputType } from "../base/text-input";
import { InternalLink } from "../base/link";

const ButtonContainer = styled(StyleableFlexContainer)`
  padding-top: 1rem;
`;

/**
 * A form to create an account.
 */
export const RegisterForm = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const {
    value: didSignup,
    isFetching: signupInProgress,
    error: signupError,
    forcePerformRequest: sendSignupRequest,
  } = useApi(
    async (api, wasTriggeredManually) => {
      if (wasTriggeredManually) {
        await api.signup(firstName, lastName, email, password);
        return true;
      }

      return false;
    },
    [email, password, firstName, lastName],
  );

  const formInProgress = signupInProgress;
  const signupDone = Boolean(didSignup) && !signupInProgress && !signupError;

  const handleSubmit = useCallback((event: React.SyntheticEvent) => {
    event.preventDefault();
  }, []);

  if (signupDone) {
    return <Redirect to={Routes.SignupDone} />;
  }

  return (
    <FlexColumnContainer>
      <Heading text="Register" />

      {signupError && (
        <Message type="error">
          <b>Signup error: </b> {signupError.message}
        </Message>
      )}

      <form onSubmit={handleSubmit}>
        <TextInput
          title="First Name"
          placeholder="John"
          value={firstName}
          onChange={(value) => setFirstName(value)}
          type={TextInputType.Text}
          name="firstName"
          autoFocus
          autoCompleteField="firstName"
        />
        <TextInput
          title="Last Name"
          placeholder="Doe"
          value={lastName}
          onChange={(value) => setLastName(value)}
          type={TextInputType.Text}
          name="lastName"
          autoFocus
          autoCompleteField="lastName"
        />
        <TextInput
          title="E-Mail"
          placeholder="me@foo.bar"
          value={email}
          onChange={(value) => setEmail(value)}
          type={TextInputType.Email}
          name="email"
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

        <InternalLink to={Routes.Login}>« Back to login</InternalLink>

        <ButtonContainer style={{ marginTop: "1rem", width: "100%" }}>
          <Button
            onClick={sendSignupRequest}
            loading={formInProgress}
            disable={formInProgress}
            primary
          >
            Register
          </Button>
        </ButtonContainer>
      </form>
    </FlexColumnContainer>
  );
};
