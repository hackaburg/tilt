import styled from "@emotion/styled";
import * as React from "react";
import { UserRole } from "../../../api/types/enums";
import { useLoginContext } from "../../../contexts/login-context";
import { useSettingsContext } from "../../../contexts/settings-context";
import { Routes } from "../../../routes";
import { variables } from "../../../theme";
import { StyleableFlexContainer } from "../../base/flex";
import { Image } from "../../base/image";
import { SidebarMenu, SidebarMenuItem } from "./sidebar-menu";

const BackgroundContainer = styled(StyleableFlexContainer)`
  height: 100%;
  overflow-y: auto;
  background: linear-gradient(
    to top right,
    ${variables.colorGradientStart},
    ${variables.colorGradientEnd}
  );
`;

const ImageContainer = styled(StyleableFlexContainer)`
  padding: 2rem;
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

  const { user, logout } = loginState;
  const role = user?.role ?? UserRole.User;
  const isAdmitted = user?.admitted ?? false;
  const isElevatedUser = [UserRole.Moderator, UserRole.Root].includes(role);

  return (
    <BackgroundContainer>
      <ImageContainer>
        <Image src={settings?.frontend.sidebarImage} label="Hackathon logo" />
      </ImageContainer>

      <SidebarMenu>
        <SidebarMenuItem to={Routes.Status}>Status</SidebarMenuItem>
        <SidebarMenuItem to={Routes.ProfileForm}>Profile</SidebarMenuItem>
        {isAdmitted && (
          <SidebarMenuItem to={Routes.ConfirmationForm}>
            Confirmation
          </SidebarMenuItem>
        )}
        {isElevatedUser && (
          <>
            <SidebarMenuItem to={Routes.Admission}>Admission</SidebarMenuItem>
            <SidebarMenuItem to={Routes.Statistics}>Statistics</SidebarMenuItem>
          </>
        )}
        {role === UserRole.Root && (
          <>
            <SidebarMenuItem to={Routes.Settings}>Settings</SidebarMenuItem>
            <SidebarMenuItem to={Routes.System}>System</SidebarMenuItem>
          </>
        )}

        <SidebarMenuItem to={Routes.Logout} onClick={logout}>
          Logout
        </SidebarMenuItem>
      </SidebarMenu>
    </BackgroundContainer>
  );
};
