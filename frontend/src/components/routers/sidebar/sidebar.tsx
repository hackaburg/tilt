import styled from "@emotion/styled";
import * as React from "react";
import { UserRole } from "../../../api/types/enums";
import { useLoginContext } from "../../../contexts/login-context";
import { Routes } from "../../../routes";
import { variables } from "../../../theme";
import { StyleableFlexContainer } from "../../base/flex";
import { SidebarMenu, SidebarMenuItem } from "./sidebar-menu";
import { LuLayoutDashboard } from "react-icons/lu";
import { LuUser } from "react-icons/lu";
import { BiLogOutCircle } from "react-icons/bi";
import { FaRegCircleCheck } from "react-icons/fa6";
import { IoStatsChartOutline } from "react-icons/io5";
import { VscSettings } from "react-icons/vsc";
import { FaHeartBroken } from "react-icons/fa";
import { GrUserExpert } from "react-icons/gr";
import sha256 from "sha256";
import { NavLink } from "react-router-dom";
import { transitionDuration } from "../../../config";
import { GrGroup } from "react-icons/gr";

const BackgroundContainer = styled(StyleableFlexContainer)`
  height: 100%;
  overflow-y: auto;
  background: linear-gradient(
    to top right,
    ${variables.colorGradientStart},
    ${variables.colorGradientEnd}
  );
`;

const LI = styled.li`
  display: block;
`;

const Link = styled(NavLink)`
  display: block;
  padding: 1rem 1.5rem;
  font-size: 1.2rem;

  transition-property: background-color;
  transition-duration: ${transitionDuration};

  color: #929292;
  text-decoration: none;

  &.active {
    color: white;
  }

  &:hover {
    color: white;
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

  const { user, logout } = loginState;
  const role = user?.role ?? UserRole.User;
  const isAdmitted = user?.admitted ?? false;
  const isElevatedUser = [UserRole.Moderator, UserRole.Root].includes(role);

  const getGravatarUrl = (mail: string, size: string) => {
    const address = String(mail).trim().toLowerCase();
    const hash = sha256(address);
    // Grab the actual image URL
    return `https://www.gravatar.com/avatar/${hash}?s=${size}`;
  };

  const H1 = styled.h1`
    font-size: 2.3rem;
    margin: 0;
    padding: 0.25rem 0;
  `;

  const H2 = styled.h2`
    font-size: 1.6rem;
    margin: 0;
    margin-top: -0.5rem;
  `;

  return (
    <BackgroundContainer>
      <div style={{ padding: "2rem" }}>
        <H1 style={{ color: "white" }}>HACKABURG</H1>
        <H2 style={{ color: "white" }}>CONTROL CENTER</H2>
        <p style={{ color: "white" }}>
          All important information about <br></br>the <b>Hackaburg 2024</b>{" "}
          event
        </p>
      </div>

      {/*  <ImageContainer>
        <Image src={settings?.frontend.sidebarImage} label="Hackathon logo" />
      </ImageContainer> */}

      <SidebarMenu>
        <SidebarMenuItem to={Routes.Status}>
          <LuLayoutDashboard />
          <span style={{ marginLeft: "1rem" }}> Dashboard</span>
        </SidebarMenuItem>
        {/*   <SidebarMenuItem to={Routes.Map}>
          <GrMapLocation />
          <span style={{ marginLeft: "1rem" }}> Map</span>
        </SidebarMenuItem>
        <SidebarMenuItem to={Routes.Challenges}>
          <TbSubtask />
          <span style={{ marginLeft: "1rem" }}> Challenges</span>
        </SidebarMenuItem> */}
        <SidebarMenuItem to={Routes.ProfileForm}>
          <LuUser />
          <span style={{ marginLeft: "1rem" }}> Profile</span>
        </SidebarMenuItem>

        {isAdmitted && (
          <SidebarMenuItem to={Routes.ConfirmationForm}>
            <GrUserExpert />
            <span style={{ marginLeft: "1rem" }}> Confirmation</span>
          </SidebarMenuItem>
        )}

        <SidebarMenuItem to={Routes.Teams}>
          <GrGroup />
          <span style={{ marginLeft: "1rem" }}>
            {" "}
            Teams <b style={{ color: "#3fb28f", fontSize: "1rem" }}> - beta</b>
          </span>
        </SidebarMenuItem>

        {isElevatedUser && (
          <>
            <div style={{ padding: "1rem" }}>
              <div
                style={{
                  width: "100%",
                  height: "10px",
                  borderBottom: "1px solid white",
                  textAlign: "center",
                }}
              >
                <span
                  style={{
                    fontSize: "0.9rem",
                    backgroundColor: "#000",
                    padding: "0 10px",
                    color: "white",
                    float: "left",
                    marginLeft: "1rem",
                  }}
                >
                  Admin
                </span>
              </div>
            </div>
            <SidebarMenuItem to={Routes.Admission}>
              <FaRegCircleCheck />
              <span style={{ marginLeft: "1rem" }}>Admission</span>
            </SidebarMenuItem>
            <SidebarMenuItem to={Routes.Statistics}>
              <IoStatsChartOutline />
              <span style={{ marginLeft: "1rem" }}>Statistics</span>
            </SidebarMenuItem>
          </>
        )}
        {role === UserRole.Root && (
          <>
            <SidebarMenuItem to={Routes.Settings}>
              <VscSettings />
              <span style={{ marginLeft: "1rem" }}>Settings</span>
            </SidebarMenuItem>
            <SidebarMenuItem to={Routes.System}>
              <FaHeartBroken />
              <span style={{ marginLeft: "1rem" }}>System</span>
            </SidebarMenuItem>
          </>
        )}
      </SidebarMenu>
      <div style={{ bottom: "1rem", position: "absolute" }}>
        <LI>
          <div style={{ display: "flex", padding: "1rem" }}>
            <a
              href="https://www.gravatar.com/"
              target="_blank"
              rel="noreferrer"
            >
              <img
                style={{ borderRadius: "5rem" }}
                height={50}
                src={getGravatarUrl(user?.email ?? "", "50")}
              />
            </a>
            <div
              style={{
                padding: "0.8rem",
                paddingTop: "0.45rem",
                marginLeft: "0.5rem",
                color: "white",
              }}
            >
              <p style={{ fontSize: "1rem", margin: "0" }}>
                {user?.firstName} {user?.lastName}
              </p>
              <p style={{ fontSize: "0.6rem", margin: "0" }}>{user?.email}</p>
            </div>
            <Link to={Routes.Logout} exact onClick={logout}>
              <div style={{ marginLeft: "0.5rem", marginTop: "-0.5rem" }}>
                <BiLogOutCircle size={25} />
              </div>
            </Link>
          </div>
        </LI>
      </div>
    </BackgroundContainer>
  );
};
