import * as React from "react";
import { useState } from "react";
import { connect } from "react-redux";
import { ScaleLoader } from "react-spinners";
import { bindActionCreators, Dispatch } from "redux";
import styled, { keyframes } from "styled-components";
import { login as loginRaw } from "../actions/login";
import { signup as signupRaw } from "../actions/signup";
import { transitionDuration } from "../config";
import { FormType, IState } from "../state";
import { Button } from "./button";
import { InnerCenteredContainer, OuterCenteredContainer, PageSizedContainer } from "./centering";
import { Heading } from "./headings";
import { Message } from "./message";
import { TextInput } from "./text-input";

const FormContainer = styled.div`
  margin: 2rem 0rem;
  width: 300px;
  max-height: 100vh;
`;

const ImageContainer = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const ImageFadeInKeyframes = keyframes`
  0% {
    max-height: 2rem;
    opacity: 0;
  }

  100% {
    max-height: 8rem;
    opacity: 1;
  }
`;

const Image = styled.img`
  max-height: 8rem;
  max-width: 100%;
  animation-name: ${ImageFadeInKeyframes};
  animation-duration: ${transitionDuration};
  animation-timing-function: ease-out;
  animation-iteration-count: 1;
`;

const Form = styled.div`
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
  imageUrl: string;
  error?: string;
  requestInProgress: boolean;
  formType: FormType;
  signup: typeof signupRaw;
  login: typeof loginRaw;
}

/**
 * A form to create an account.
 */
export const LoginSignupForm = ({ imageUrl, formType, requestInProgress, error, signup, login }: ILoginSignupFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <PageSizedContainer>
      <OuterCenteredContainer>
        <InnerCenteredContainer>
          <FormContainer>
            <ImageContainer>
              {imageUrl && (
                <Image src={imageUrl} />
              )}

              {!imageUrl && (
                <ScaleLoader
                  height={1}
                  heightUnit="rem"
                  color="currentColor"
                  css={{
                    display: "inline-block",
                    margin: "auto",
                    padding: "1rem 0rem",
                  } as any}
                />
              )}
            </ImageContainer>

            {!error && (
              <>
                <Heading>Apply</Heading>
                <p>Create an account or login.</p>
              </>
            )}

            {error && (
              <Message error><b>Error:</b> {error}</Message>
            )}

            <Form onSubmit={(event) => event.preventDefault()}>
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
                loading={formType === FormType.Signup && requestInProgress}
                disable={formType === FormType.Login && requestInProgress}
                primary
                fluid
              >Create my account</Button>
              <Divider>Already have an account?</Divider>
              <Button
                onClick={() => login(email, password)}
                loading={formType === FormType.Login && requestInProgress}
                disable={formType === FormType.Signup && requestInProgress}
                fluid
              >Let me in</Button>
            </Form>
          </FormContainer>
        </InnerCenteredContainer>
      </OuterCenteredContainer>
    </PageSizedContainer>
  );
};

const mapStateToProps = (state: IState) => ({
  error: state.request.error,
  formType: state.form.type,
  imageUrl: state.settings.data.frontend.loginSignupImage,
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
