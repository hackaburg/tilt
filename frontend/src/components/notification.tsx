import * as React from "react";
import styled from "styled-components";
import { borderRadius, transitionDuration } from "../config";

interface IContainerProps {
  show: boolean;
}

const Container = styled.div<IContainerProps>`
  position: fixed;
  top: 1rem;
  right: -5rem;
  opacity: 0;

  padding: 0.75rem 1.5rem;

  text-transform: uppercase;
  font-weight: bold;
  font-size: 0.7rem;
  background-color: #333;
  color: white;
  border-radius: ${borderRadius};
  box-shadow: 0px 5px 10px rgba(0, 0, 0, 0.05);

  transition-property: right, opacity;
  transition-duration: ${transitionDuration};

  z-index: 100;

  ${(props) =>
    props.show &&
    `
    right: 1rem;
    opacity: 1;
  `}
`;

interface INotificationProps {
  message: string;
  show: boolean;
}

/**
 * A notification displayed in the top right corner.
 */
export const Notification = ({ message, show }: INotificationProps) => (
  <Container show={show}>{message}</Container>
);
