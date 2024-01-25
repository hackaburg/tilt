import styled from "@emotion/styled";
import * as React from "react";
import { useCallback, useState } from "react";
import { useLoginContext } from "../../contexts/login-context";
import { useApi } from "../../hooks/use-api";
import { Button } from "../base/button";
import { FlexColumnContainer, StyleableFlexContainer } from "../base/flex";
import { Heading } from "../base/headings";
import { Message } from "../base/message";
import { TextInput, TextInputType } from "../base/text-input";

const ButtonContainer = styled(StyleableFlexContainer)`
  padding-top: 1rem;
`;

/**
 * A form to create an account.
 */
export const LoginForm = () => {
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

  const formInProgress = loginInProgress;

  const handleSubmit = useCallback((event: React.SyntheticEvent) => {
    event.preventDefault();
  }, []);

  return (
    <FlexColumnContainer>
      <Heading text="Sign in to your account" />

      {loginError && (
        <Message error>
          <b>Login error: </b> {loginError.message}
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

        <div>
          <a
            href="/forgot-password"
            style={{
              color: "#9ac017",
              textDecoration: "none",
              float: "right",
            }}
          >
            Forgot Password?
          </a>
        </div>

        <ButtonContainer style={{ marginTop: "1rem", width: "100%" }}>
          <Button
            onClick={sendLoginRequest}
            loading={loginInProgress}
            disable={formInProgress}
            primary
          >
            Login
          </Button>
          <div
            style={{
              textAlign: "center",
              padding: "1rem",
            }}
          >
            New user?{" "}
            <a
              href="/register-form"
              style={{
                color: "#9ac017",
                textDecoration: "none",
              }}
            >
              Register
            </a>
          </div>
        </ButtonContainer>
      </form>
    </FlexColumnContainer>
  );
};
