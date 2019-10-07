import styled from "styled-components";
import { headerBarHeight, sidebarWidth, transitionDuration } from "../config";
import { ISidebarAwareProps } from "./page-wrapper";

/**
 * Header bar for all views. Usually shows control to show/hide sidebar.
 */
export const HeaderBar = styled.div<ISidebarAwareProps>`
  position: fixed;
  display: flex;

  top: 0;
  left: 0;
  right: 0;

  height: ${headerBarHeight};

  z-index: 1;

  background-color: white;
  box-shadow: 0 4px 2px -2px rgba(0, 0, 0, 0.1);

  flex-direction: row;
  align-items: center;
  justify-content: center;

  transition-property: left;
  transition-duration: ${transitionDuration};

  ${(props) =>
    props.showSidebar &&
    `
    left: ${sidebarWidth};
  `}
`;
