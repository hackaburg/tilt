import * as React from "react";
import { connect } from "react-redux";
import { bindActionCreators, Dispatch } from "redux";
import styled from "styled-components";
import { UserRole } from "../../../types/roles";
import { logout as logoutRaw } from "../actions/login";
import { Routes } from "../routes";
import { IState } from "../state";
import { ConnectedSidebarLogo } from "./sidebar-logo";
import { SidebarMenu, SidebarMenuItem } from "./sidebar-menu";

const Container = styled.div`
  position: relative;
  width: 100%;
  height: 100%;

  ${(props) => `
    background: linear-gradient(to top right, ${props.theme.colorGradientStart}, ${props.theme.colorGradientEnd});
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
  logout: typeof logoutRaw;
}

/**
 * The sidebar containing the menu and a logo
 */
export const Sidebar = ({ role, logout }: ISidebarProps) => (
  <Container>
    <ConnectedSidebarLogo />

    <SidebarMenu>
        <SidebarMenuItem to={Routes.Dashboard}>Dashboard</SidebarMenuItem>

        {[UserRole.Moderator, UserRole.Owner].includes(role) && (
          <>
            <SidebarMenuItem to={Routes.Users}>Users</SidebarMenuItem>
            <SidebarMenuItem to={Routes.Statistics}>Statistics</SidebarMenuItem>
          </>
        )}

        {role === UserRole.Owner && (
          <>
            <SidebarMenuItem to={Routes.Activity}>Activity</SidebarMenuItem>
            <SidebarMenuItem to={Routes.Settings}>Settings</SidebarMenuItem>
          </>
        )}

        <SidebarMenuItem to={Routes.Logout} onClick={logout}>Logout</SidebarMenuItem>
    </SidebarMenu>
  </Container>
);

const mapStateToProps = (state: IState) => ({
  role: state.role || UserRole.User,
});

const mapDispatchToProps = (dispatch: Dispatch) => {
  return bindActionCreators({
    logout: logoutRaw,
  }, dispatch);
};

/**
 * The sidebar connected to the redux store.
 */
export const ConnectedSidebar = connect(mapStateToProps, mapDispatchToProps)(Sidebar);
