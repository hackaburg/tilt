import * as React from "react";
import { useEffect } from "react";
import { connect } from "react-redux";
import { bindActionCreators, Dispatch } from "redux";
import styled from "styled-components";
import { verifyEmail } from "../actions/verify";
import { Routes } from "../routes";
import { IState, RequestTarget } from "../state";
import { CenteredContainer, PageSizedContainer } from "./centering";
import { Link } from "./link";
import { ConnectedLoginImage } from "./login-image";
import { Message } from "./message";

const Container = styled.div`
  width: 300px;
`;

interface IVerifyEmailProps {
  verificationInProgress: boolean;
  error?: string | false;
  token: string;
  dispatchVerifyEmail: typeof verifyEmail;
}

/**
 * A dialog to verify the user's email address via the given token.
 */
export const VerifyEmail = ({ token, dispatchVerifyEmail, error, verificationInProgress }: IVerifyEmailProps) => {
  if (token.startsWith("#")) {
    token = token.substring(1);
  }

  useEffect(() => {
    dispatchVerifyEmail(token);
  }, []);

  return (
    <PageSizedContainer>
      <CenteredContainer>
        <Container>
          <ConnectedLoginImage />
          {error && (
            <Message error><b>Error:</b> {error}</Message>
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

const mapStateToProps = (state: IState) => ({
  error: state.request[RequestTarget.VerifyEmail].error,
  verificationInProgress: state.request[RequestTarget.VerifyEmail].requestInProgress,
});

const mapDispatchToProps = (dispatch: Dispatch) => {
  return bindActionCreators({
    dispatchVerifyEmail: verifyEmail,
  }, dispatch);
};

/**
 * The verify email component connected to the redux store.
 */
export const ConnectedVerifyEmail = connect(mapStateToProps, mapDispatchToProps)(VerifyEmail);
