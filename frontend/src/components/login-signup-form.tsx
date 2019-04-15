import * as React from "react";
import { useState } from "react";
import { connect } from "react-redux";
import { bindActionCreators, Dispatch } from "redux";
import styled from "styled-components";
import { login as loginRaw } from "../actions/login";
import { signup as signupRaw } from "../actions/signup";
import { FormType, IState } from "../state";
import { BlurContainer } from "./blur-container";
import { Button } from "./button";
import { CenteredContainer, PageSizedContainer } from "./centering";
import { FadeContainer } from "./fade-container";
import { Heading } from "./headings";
import { ConnectedLoginImage } from "./login-image";
import { Message } from "./message";
import { TextInput } from "./text-input";

const Container = styled.div`
  margin: 2rem 0rem;
  width: 300px;
  max-height: 100vh;
`;

const SignupDoneMessage = styled(FadeContainer)`
  position: absolute;
`;

const FormContainer = styled.div`
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

interface ILoginSignupFormProps {
  error?: string;
  requestInProgress: boolean;
  formType: FormType;
  signup: typeof signupRaw;
  login: typeof loginRaw;
}

/**
 * A form to create an account.
 */
export const LoginSignupForm = ({ formType, requestInProgress, error, signup, login }: ILoginSignupFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const signupInProgress = formType === FormType.Signup && requestInProgress;
  const loginInProgress = formType === FormType.Login && requestInProgress;
  const formInProgress = signupInProgress || loginInProgress;
  const signupDone = formType === FormType.Signup && !requestInProgress && !error;

  return (
    <PageSizedContainer>
      <CenteredContainer>
        <Container>
          <ConnectedLoginImage />

          <SignupDoneMessage show={signupDone}>
            <Heading>Done.</Heading>
            <p>We've sent you an email with a button to verify yourself.</p>
            <p>It might take a minute or two to arrive, and to be safe, please also check your junk mail.</p>
          </SignupDoneMessage>

          <BlurContainer blur={signupDone}>
            {!error && (
              <>
                <Heading>Apply</Heading>
                <p>Create an account or login.</p>
              </>
            )}

            {error && (
              <Message error><b>Error:</b> {error}</Message>
            )}

            <FormContainer>
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
                  password={true}
                />
              </Fields>

              <Button
                onClick={() => signup(email, password)}
                loading={signupInProgress}
                disable={formInProgress}
                primary
                fluid
              >Create my account</Button>
              <Divider>Already have an account?</Divider>
              <Button
                onClick={() => login(email, password)}
                loading={loginInProgress}
                disable={formInProgress}
                fluid
              >Let me in</Button>
            </FormContainer>
          </BlurContainer>
        </Container>
      </CenteredContainer>
    </PageSizedContainer>
  );
};

const mapStateToProps = (state: IState) => ({
  error: state.request.error,
  formType: state.form.type,
  requestInProgress: state.request.requestInProgress,
});

const mapDispatchToProps = (dispatch: Dispatch) => {
  return bindActionCreators({
    login: loginRaw,
    signup: signupRaw,
  }, dispatch);
};

/**
 * The signup form connected to the redux store.
 */
export const ConnectedLoginSignupForm = connect(mapStateToProps, mapDispatchToProps)(LoginSignupForm);
