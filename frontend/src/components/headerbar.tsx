import styled from "styled-components";
import { headerBarHeight, sidebarWidth, transitionDuration } from "../config";
import { ISidebarAwareProps } from "./dashboard";

/**
 * Header bar for all views. Usually shows control to show/hide sidebar.
 */
export const HeaderBar = styled.div<ISidebarAwareProps>`
  position: fixed;
  display: flex;

  top: 0px;

  z-index: 1;

  transition-property: left;
  transition-duration: ${transitionDuration};
  justify-content: center;

  background-color: white;
  box-shadow: 0 4px 2px -2px gray;

  align-items: center;
  justify-content: center;

  width: 100vw;
  height: ${ headerBarHeight };

  flex-direction: row;

  ${(props) => props.showSidebar && `
    left: ${sidebarWidth};
  `}
`;
