import styled from "@emotion/styled";
import * as React from "react";
import { Route, Switch } from "react-router";
import {
  mediaBreakpoints,
  sidebarWidth,
  transitionDuration,
} from "../../config";
import { useIsResponsive } from "../../hooks/use-is-responsive";
import { useToggle } from "../../hooks/use-toggle";
import { Routes } from "../../routes";
import {
  FlexRowColumnContainer,
  FlexRowContainer,
  PageSizedContainer,
  StyleableFlexContainer,
} from "../base/flex";
import { ConfirmationForm } from "../pages/confirmation-form";
import { LazyAdmission } from "../pages/lazy-admission";
import { LazySettings } from "../pages/lazy-settings";
import { LazyStatistics } from "../pages/lazy-statistics";
import { LazySystem } from "../pages/lazy-system";
import { PageNotFound } from "../pages/page-not-found";
import { ProfileForm } from "../pages/profile-form";
import { Status } from "../pages/status";
import { Sidebar } from "./sidebar/sidebar";
import { SidebarToggle } from "./sidebar/sidebar-toggle";
import { Map } from "../pages/map";
import { Challenges } from "../pages/challenges";
import { Teams } from "../pages/teams";
import { CreateTeam } from "../pages/createTeam";

const SidebarSliderContainer = styled(StyleableFlexContainer)`
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  transform: translateX(0%);
  transition-property: transform;
  transition-duration: ${transitionDuration};
  width: ${sidebarWidth};

  z-index: 1;
  will-change: transform;

  @media screen and (max-width: ${mediaBreakpoints.tablet}) {
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.3);
  }
`;

const ToggleContainer = styled(StyleableFlexContainer)`
  position: absolute;
  top: 1rem;
  right: -5rem;
`;

const ContentContainer = styled(StyleableFlexContainer)`
  padding-left: ${sidebarWidth};
  transform: translateX(0%);
  transition-property: transform;
  transition-duration: ${transitionDuration};
  height: 100%;

  @media screen and (max-width: ${mediaBreakpoints.tablet}) {
    padding: 0;
    padding-top: 3rem;
  }
`;

const closedSidebarSliderStyle: React.CSSProperties = {
  transform: "translateX(-100%)",
};

const closedSidebarContentStyle: React.CSSProperties = {
  transform: "translateX(0%)",
};

/**
 * A router for authenticated users.
 */
export const AuthenticatedRouter = () => {
  const isResponsive = useIsResponsive();
  const [isSidebarVisible, toggleIsSidebarVisible] = useToggle(false);
  const isSidebarHidden = !isSidebarVisible && isResponsive;

  return (
    <PageSizedContainer>
      <SidebarSliderContainer
        style={isSidebarHidden ? closedSidebarSliderStyle : undefined}
      >
        <Sidebar />

        {isResponsive && (
          <ToggleContainer>
            <SidebarToggle onClick={toggleIsSidebarVisible} />
          </ToggleContainer>
        )}
      </SidebarSliderContainer>

      <ContentContainer
        style={isSidebarHidden ? closedSidebarContentStyle : undefined}
      >
        <FlexRowContainer>
          <FlexRowColumnContainer>
            <Switch>
              <Route path={Routes.Status} component={Status} />
              <Route path={Routes.Teams} component={Teams} />
              <Route path={Routes.CreateTeam} component={CreateTeam} />
              <Route path={Routes.ProfileForm} component={ProfileForm} />
              <Route path={Routes.Map} component={Map} />
              <Route path={Routes.Challenges} component={Challenges} />
              <Route
                path={Routes.ConfirmationForm}
                component={ConfirmationForm}
              />
              <Route path={Routes.Admission} component={LazyAdmission} />
              <Route path={Routes.Statistics} component={LazyStatistics} />
              <Route path={Routes.Settings} component={LazySettings} />
              <Route path={Routes.System} component={LazySystem} />
              <Route component={PageNotFound} />
            </Switch>
          </FlexRowColumnContainer>
        </FlexRowContainer>
      </ContentContainer>
    </PageSizedContainer>
  );
};
