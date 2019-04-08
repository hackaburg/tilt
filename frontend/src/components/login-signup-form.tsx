import * as React from "react";
import { useState } from "react";
import { connect } from "react-redux";
import { BarLoader } from "react-spinners";
import styled, { keyframes } from "styled-components";
import { transitionDuration } from "../config";
import { IState } from "../state";
import { Button } from "./button";
import { InnerCenteredContainer, OuterCenteredContainer, PageSizedContainer } from "./centering";
import { Heading } from "./headings";
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

const Form = styled.form`
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
}

/**
 * A form to create an account.
 */
export const LoginSignupForm = ({ imageUrl }: ILoginSignupFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
  };

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
                <BarLoader
                  css={`
                    display: inline-block;
                    margin: auto;
                    height: 4rem;
                  `}
                />
              )}
            </ImageContainer>
            <Heading>Apply</Heading>
            <p>Create an account or login.</p>

            <Form onSubmit={handleSubmit}>
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

              <Button primary fluid tabIndex={3}>Create my account</Button>
              <Divider>Already have an account?</Divider>
              <Button fluid tabIndex={4}>Let me in</Button>
            </Form>
          </FormContainer>
        </InnerCenteredContainer>
      </OuterCenteredContainer>
    </PageSizedContainer>
  );
};

const mapStateToProps = (state: IState) => ({
  imageUrl: state.settings.data.frontend.signupImage,
});

/**
 * The signup form connected to the redux store.
 */
export const ConnectedLoginSignupForm = connect(mapStateToProps)(LoginSignupForm);
