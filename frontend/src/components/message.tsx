import styled from "@emotion/styled";
import { borderRadius } from "../config";

interface IMessageProps {
  error?: boolean;
  warn?: boolean;
}

/**
 * A message to display some text.
 */
export const Message = styled.div<IMessageProps>`
  padding: 0.5rem;

  border: 1px solid #ccc;
  border-radius: ${borderRadius};
  background-color: #f7f7f7;

  box-shadow: 0px 3px 5px rgba(0, 0, 0, 0.05);

  ${(props) =>
    props.error &&
    `
    color: #721c24;
    background-color: #f8d7da;
    border-color: #f5c6cb;
  `}

  ${(props) =>
    props.warn &&
    `
    color: #856404;
    background-color: #fff3cd;
    border-color: #ffeeba;
  `}
`;
