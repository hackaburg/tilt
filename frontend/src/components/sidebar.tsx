import * as React from "react";
import { connect } from "react-redux";
import styled from "styled-components";
import { UserRole } from "../../../types/roles";
import { clearLoginToken } from "../authentication";
import { IState } from "../state";
import { ConnectedSidebarLogo } from "./sidebar-logo";
import { SidebarMenu, SidebarMenuItem } from "./sidebar-menu";

const Container = styled.div`
  position: relative;
  width: 100%;
  height: 100%;

  ${(props) => `
    background: linear-gradient(to right, ${props.theme.colorGradientStart}, ${props.theme.colorGradientEnd});
  `}

  &::after {
    content: " ";
    display: block;
    width: 1px;

    position: absolute;
    right: 0px;
    top: 0px;
    bottom: 0px;

    box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.05);
  }
`;

interface ISidebarProps {
  role: UserRole;
}

/**
 * The sidebar containing the menu and a logo
 */
export const Sidebar = ({ role }: ISidebarProps) => (
  <Container>
    <ConnectedSidebarLogo />

    <SidebarMenu>
        <SidebarMenuItem to="/">Dashboard</SidebarMenuItem>

        {role === UserRole.Owner && (
          <>
            <SidebarMenuItem to="/settings">Settings</SidebarMenuItem>
          </>
        )}

        <SidebarMenuItem to="/logout" onClick={() => clearLoginToken()}>Logout</SidebarMenuItem>
    </SidebarMenu>
  </Container>
);

const mapStateToProps = (state: IState) => ({
  role: state.role || UserRole.User,
});

/**
 * The sidebar connected to the redux store.
 */
export const ConnectedSidebar = connect(mapStateToProps)(Sidebar);
