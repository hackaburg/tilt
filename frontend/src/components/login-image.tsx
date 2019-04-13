import * as React from "react";
import { connect } from "react-redux";
import { ScaleLoader } from "react-spinners";
import styled, { keyframes } from "styled-components";
import { transitionDuration } from "../config";
import { IState } from "../state";

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

interface ILoginImageProps {
  imageUrl: string;
}

/**
 * The image displayed on the login and signup page.
 */
export const LoginImage = ({ imageUrl }: ILoginImageProps) => (
  <Container>
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
  </Container>
);

const mapStateToProps = (state: IState) => ({
  imageUrl: state.settings.frontend.loginSignupImage,
});

/**
 * The login/signup image connected to the redux store.
 */
export const ConnectedLoginImage = connect(mapStateToProps)(LoginImage);
