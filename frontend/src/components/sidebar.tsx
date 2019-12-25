import * as React from "react";
import styled from "styled-components";
import { UserRole } from "../../../types/roles";
import { useLoginContext } from "../contexts/login-context";
import { Routes } from "../routes";
import { SidebarLogo } from "./sidebar-logo";
import { SidebarMenu, SidebarMenuItem } from "./sidebar-menu";

const Container = styled.div`
  overflow: auto;
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

/**
 * The sidebar containing the menu and a logo
 */
export const Sidebar = () => {
  const loginState = useLoginContext();

  if (!loginState.isLoggedIn) {
    return null;
  }

  const { role, logout } = loginState;
  const isElevatedUser = [UserRole.Moderator, UserRole.Owner].includes(role);

  return (
    <Container>
      <SidebarLogo />

      <SidebarMenu>
        <SidebarMenuItem to={Routes.Dashboard}>Dashboard</SidebarMenuItem>

        {isElevatedUser && (
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

        <SidebarMenuItem to={Routes.Logout} onClick={logout}>
          Logout
        </SidebarMenuItem>
      </SidebarMenu>
    </Container>
  );
};
