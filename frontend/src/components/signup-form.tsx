import * as React from "react";
import { useState } from "react";
import styled from "styled-components";
import { Button } from "./button";
import { Heading } from "./headings";
import { TextInput } from "./text-input";

const Container = styled.div`
  width: 300px;
  max-height: 100vh;
  overflow-y: auto;
`;

const ImageContainer = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const Image = styled.img`
  width: 60%;
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
}

/**
 * A form to create an account.
 */
export const SignupForm = ({ }: ISignupFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
  };

  return (
    <Container>
      <ImageContainer>
        <Image src="https://hackaburg.de/apply/assets/images/logo-inverted.png" />
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
        Already have an account?
      </p>
    </Container>
  );
};
