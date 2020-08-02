import styled from "@emotion/styled";
import * as React from "react";
import FlexView from "react-flexview";
import { UserRole } from "../api/types/enums";
import { sidebarWidth } from "../config";
import { useLoginContext } from "../contexts/login-context";
import { useSettingsContext } from "../contexts/settings-context";
import { Routes } from "../routes";
import { variables } from "../theme";
import { Image } from "./image";
import { SidebarMenu, SidebarMenuItem } from "./sidebar-menu";

const BackgroundContainer = styled(FlexView)`
  overflow-y: auto;
  background: linear-gradient(
    to top right,
    ${variables.colorGradientStart},
    ${variables.colorGradientEnd}
  );
`;

const ImageContainer = styled(FlexView)`
  padding: 2rem;
  width: ${sidebarWidth};
`;

/**
 * The sidebar containing the menu and a logo
 */
export const Sidebar = () => {
  const { settings } = useSettingsContext();
  const loginState = useLoginContext();

  if (!loginState.isLoggedIn) {
    return null;
  }

  const { role, logout } = loginState;
  const isElevatedUser = [UserRole.Moderator, UserRole.Root].includes(role);

  return (
    <BackgroundContainer column grow>
      <ImageContainer vAlignContent="top" shrink={false}>
        <Image src={settings?.frontend.sidebarImage} label="Hackathon logo" />
      </ImageContainer>

      <SidebarMenu>
        <SidebarMenuItem to={Routes.Dashboard}>Dashboard</SidebarMenuItem>
        <SidebarMenuItem to={Routes.ProfileForm}>Profile</SidebarMenuItem>

        {isElevatedUser && (
          <>
            <SidebarMenuItem to={Routes.AdmissionCenter}>
              Admission Center
            </SidebarMenuItem>
            <SidebarMenuItem to={Routes.Statistics}>Statistics</SidebarMenuItem>
          </>
        )}

        {role === UserRole.Root && (
          <>
            <SidebarMenuItem to={Routes.Settings}>Settings</SidebarMenuItem>
          </>
        )}

        <SidebarMenuItem to={Routes.Logout} onClick={logout}>
          Logout
        </SidebarMenuItem>
      </SidebarMenu>
    </BackgroundContainer>
  );
};
