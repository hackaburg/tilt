import styled from "@emotion/styled";
import * as React from "react";
import { useCallback, useState } from "react";
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
export const ForgotPassword = () => {
  const [email, setEmail] = useState("");

  const {
    isFetching: loginInProgress,
    error: loginError,
    forcePerformRequest: forgotPasswordRequest,
  } = useApi(
    async (api, wasTriggeredManually) => {
      if (wasTriggeredManually) {
        await api.forgotPassword(email);
      }
    },
    [email],
  );

  const formInProgress = loginInProgress;

  const handleSubmit = useCallback((event: React.SyntheticEvent) => {
    event.preventDefault();
  }, []);

  return (
    <FlexColumnContainer>
      <Heading text="Forgot Your Password?" />

      {loginError && (
        <Message error>
          <b>Reset password error: </b> {loginError.message}
        </Message>
      )}

      <form onSubmit={handleSubmit}>
        <TextInput
          title="E-Mail"
          placeholder="me@foo.bar"
          value={email}
          onChange={(value) => setEmail(value)}
          type={TextInputType.Email}
          name="email"
          autoFocus
          autoCompleteField="email"
        />

        <div>
          <a
            href="/login"
            style={{
              color: "#9ac017",
              textDecoration: "none",
              float: "left",
              fontSize: "0.8rem",
              marginTop: "0.5rem",
            }}
          >
            {"« Back to login"}
          </a>
        </div>

        <ButtonContainer style={{ marginTop: "1rem", width: "100%" }}>
          <Button
            onClick={forgotPasswordRequest}
            loading={loginInProgress}
            disable={formInProgress}
            primary
          >
            Submit
          </Button>
        </ButtonContainer>
      </form>
    </FlexColumnContainer>
  );
};
