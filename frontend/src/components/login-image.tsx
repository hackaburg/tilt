import { keyframes } from "@emotion/core";
import styled from "@emotion/styled";
import * as React from "react";
import { transitionDuration } from "../config";
import { useSettingsContext } from "../contexts/settings-context";

const Container = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const FadeInKeyframes = keyframes`
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
  animation-name: ${FadeInKeyframes};
  animation-duration: ${transitionDuration};
  animation-timing-function: ease-out;
  animation-iteration-count: 1;
`;

/**
 * The image displayed on the login and signup page.
 */
export const LoginImage = () => {
  const { settings } = useSettingsContext();
  const imageUrl = settings?.frontend.loginSignupImage;

  return (
    <Container>
      <Image src={imageUrl} />
    </Container>
  );
};
