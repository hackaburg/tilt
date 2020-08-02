import styled from "@emotion/styled";
import * as React from "react";
import FlexView from "react-flexview";
import { borderRadius, transitionDuration } from "../../config";

const NotificationContainer = styled(FlexView)`
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
`;

const shownStyles = {
  opacity: 1,
  right: "1rem",
};

interface INotificationProps {
  message: string;
  show: boolean;
}

/**
 * A notification displayed in the top right corner.
 */
export const Notification = ({ message, show }: INotificationProps) => (
  <NotificationContainer style={show ? shownStyles : undefined}>
    {message}
  </NotificationContainer>
);
