import * as React from "react";
import FlexView from "react-flexview";
import { RouteComponentProps, withRouter } from "react-router";
import { useApi } from "../hooks/use-api";
import { Routes } from "../routes";
import { Heading } from "./headings";
import { Link } from "./link";
import { Message } from "./message";
import { Text } from "./text";

interface IVerifyEmailProps extends RouteComponentProps<any> {}

/**
 * A dialog to verify the user's email address via the given token.
 */
export const VerifyEmail = ({ location: { hash } }: IVerifyEmailProps) => {
  const token = hash.startsWith("#") ? hash.substring(1) : hash;
  const { isFetching: verificationInProgress, error } = useApi(
    async (api) => api.verifyEmail(token),
    [token],
  );

  return (
    <FlexView column>
      <Heading>Verifying your email</Heading>

      {error ? (
        <Message error>
          <b>Error:</b> {error.message}
        </Message>
      ) : verificationInProgress ? (
        <Text>This will only take a second...</Text>
      ) : (
        <>
          <Text>Successfully verified your email!</Text>
          <Link to={Routes.Login}>Back to login...</Link>
        </>
      )}
    </FlexView>
  );
};

/**
 * The email verification component, but connected to react-router.
 */
export const RoutedVerifyEmail = withRouter(VerifyEmail);
