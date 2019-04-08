import * as React from "react";
import { useState } from "react";
import { connect } from "react-redux";
import { BarLoader } from "react-spinners";
import styled, { keyframes } from "styled-components";
import { transitionDuration } from "../config";
import { IState } from "../state";
import { Button } from "./button";
import { Heading } from "./headings";
import { LinkLike } from "./link";
import { TextInput } from "./text-input";

const Container = styled.div`
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
  color: #aaa;
`;

const Fields = styled.div`
  margin-bottom: 3rem;
`;

interface ISignupFormProps {
  onOpenLogin: () => void;
  imageUrl: string;
}

/**
 * A form to create an account.
 */
export const SignupForm = ({ onOpenLogin, imageUrl }: ISignupFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
  };

  return (
    <Container>
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
      <Heading>Sign up</Heading>
      <p>Create an account to start your application.</p>

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
            placeholder="something really secure"
            value={password}
            onChange={(value) => setPassword(value)}
            password={true}
          />
        </Fields>

        <Button primary fluid tabIndex={3}>Send me the email</Button>
      </Form>

      <p>
        Already have an account? <LinkLike onClick={onOpenLogin}>Log in</LinkLike>
      </p>
    </Container>
  );
};

const mapStateToProps = (state: IState) => ({
  imageUrl: state.settings.data.frontend.signupImage,
});

/**
 * The signup form connected to the redux store.
 */
export const ConnectedSignupForm = connect(mapStateToProps)(SignupForm);
