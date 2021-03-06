import styled from "@emotion/styled";
import * as React from "react";
import { Elevated } from "./elevated";
import { FlexRowContainer } from "./flex";

const MessageContainer = styled(Elevated)`
  background-color: #f7f7f7;
  padding: 0.5rem;
`;

const ErrorMessageContainer = styled(MessageContainer)`
  color: #721c24;
  background-color: #f8d7da;
  border-color: #f5c6cb;
`;

const WarnMessageContainer = styled(MessageContainer)`
  color: #856404;
  background-color: #fff3cd;
  border-color: #ffeeba;
`;

interface IMessageProps {
  error?: boolean;
  warn?: boolean;
  children: React.ReactNode;
}

/**
 * A message to display some text.
 */
export const Message = ({ error, warn, children }: IMessageProps) => {
  const level = 1;
  const Component = error
    ? ErrorMessageContainer
    : warn
    ? WarnMessageContainer
    : MessageContainer;

  return (
    <Component level={level}>
      <FlexRowContainer>{children}</FlexRowContainer>
    </Component>
  );
};
