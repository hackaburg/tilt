import styled from "@emotion/styled";
import * as React from "react";
import { useCallback, useState } from "react";
import { useApi } from "../../hooks/use-api";
import { Button } from "../base/button";
import { FlexColumnContainer, StyleableFlexContainer } from "../base/flex";
import { Heading } from "../base/headings";
import { Message } from "../base/message";
import { TextInput, TextInputType } from "../base/text-input";
import { useLocation } from "react-router-dom";

const ButtonContainer = styled(StyleableFlexContainer)`
  padding-top: 1rem;
`;

/**
 * A form to create an account.
 */
export const ResetPassword = () => {
  const [password, setPassword] = useState("");

  const location = useLocation();
  const token = new URLSearchParams(location.search).get("token");

  const {
    isFetching: loginInProgress,
    error: loginError,
    forcePerformRequest: forgotPasswordRequest,
  } = useApi(
    async (api, wasTriggeredManually) => {
      if (wasTriggeredManually) {
        await api.resetPassword(password, token!);
      }
    },
    [password],
  );

  const formInProgress = loginInProgress;

  const handleSubmit = useCallback((event: React.SyntheticEvent) => {
    event.preventDefault();
  }, []);

  return (
    <FlexColumnContainer>
      <Heading text="Rest Your Password" />

      {loginError && (
        <Message error>
          <b>Reset password error: </b> {loginError.message}
        </Message>
      )}

      <form onSubmit={handleSubmit}>
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
