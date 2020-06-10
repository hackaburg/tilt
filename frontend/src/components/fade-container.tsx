import styled from "@emotion/styled";
import { transitionDuration } from "../config";

interface IFadeContainer extends React.Props<any> {
  show?: boolean;
}

/**
 * A container to blur something out.
 */
export const FadeContainer = styled.div<IFadeContainer>`
  transition-property: opacity;
  transition-duration: ${transitionDuration};

  opacity: 0;

  ${(props) =>
    props.show &&
    `
    opacity: 1;
  `}
`;
