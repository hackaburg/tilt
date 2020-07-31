import styled from "@emotion/styled";
import * as React from "react";
import { useApi } from "../hooks/use-api";
import { Routes } from "../routes";
import { CenteredContainer, PageSizedContainer } from "./centering";
import { Link } from "./link";
import { LoginImage } from "./login-image";
import { Message } from "./message";

const Container = styled.div`
  width: 300px;
`;

interface IVerifyEmailProps {
  token: string;
}

/**
 * A dialog to verify the user's email address via the given token.
 */
export const VerifyEmail = ({ token }: IVerifyEmailProps) => {
  if (token.startsWith("#")) {
    token = token.substring(1);
  }

  const { isFetching: verificationInProgress, error } = useApi(
    async (api) => api.verifyEmail(token),
    [token],
  );

  return (
    <PageSizedContainer>
      <CenteredContainer>
        <Container>
          <LoginImage />
          {error && (
            <Message error>
              <b>Error:</b> {error.message}
            </Message>
          )}

          {!error && (
            <>
              {verificationInProgress && (
                <p>Verifying your email address... hang tight</p>
              )}

              {!verificationInProgress && (
                <>
                  <p>Successfully verified your email!</p>
                  <Link to={Routes.Login}>Back to login...</Link>
                </>
              )}
            </>
          )}
        </Container>
      </CenteredContainer>
    </PageSizedContainer>
  );
};
