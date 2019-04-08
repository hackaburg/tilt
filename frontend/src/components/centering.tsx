import styled from "styled-components";

/**
 * A centered container. Requires an @see OuterCenteredContainer around this one.
 */
export const InnerCenteredContainer = styled.div``;

/**
 * The outer container to center an @see InnerCenteredContainer
 */
export const OuterCenteredContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;

  ${InnerCenteredContainer} {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
`;

/**
 * A page sized container.
 */
export const PageSizedContainer = styled.div`
  width: 100vw;
  height: 100vh;
  overflow: auto;
`;
