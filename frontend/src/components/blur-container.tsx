import styled from "styled-components";
import { transitionDuration } from "../config";

interface IBlurContainer extends React.Props<any> {
  blur?: boolean;
}

/**
 * A container to blur something out.
 */
export const BlurContainer = styled.div<IBlurContainer>`
  transition-property: filter, opacity, transform;
  transition-duration: ${transitionDuration};

  transform: none;
  filter: none;
  opacity: 1;

  ${(props) => props.blur && `
    transform: scale(0.75);
    filter: blur(10px);
    opacity: 0;
    pointer-events: none;
  `}
`;
