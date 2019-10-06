import * as React from "react";
import { useState } from "react";
import { Route, Switch } from "react-router";
import styled from "styled-components";
import { headerBarHeight, sidebarWidth, transitionDuration } from "../config";
import { Routes } from "../routes";
import { ConnectedActivity } from "./activity";
import { PageSizedContainer } from "./centering";
import { Dashboard } from "./dashboard";
import { HeaderBar } from "./headerbar";
import { ConnectedNotification } from "./notification";
import { PageNotFound } from "./page-not-found";
import { Settings } from "./settings";
import { ConnectedSidebar } from "./sidebar";
import { SidebarBurger } from "./sidebar-burger";
import { Statistics } from "./statistics";
import { Users } from "./users";

// Possible addition: moving the headings into the headerbar, but I wouldn't know how to accomplish that.

/**
 * Interface for whether or not the sidebar is being shown.
 */
export interface ISidebarAwareProps {
  showSidebar: boolean;
}

const SidebarContainer = styled.div<ISidebarAwareProps>`
  position: fixed;
  top: 0px;
  bottom: 0px;
  left: -${sidebarWidth};

  display: block;
  width: ${sidebarWidth};

  z-index: 1;

  transition-property: left;
  transition-duration: ${transitionDuration};
  overflow-x: hidden;

  ${(props) => props.showSidebar && `
    left: 0px;
  `}
`;

const SidebarBurgerContainer = styled.div<ISidebarAwareProps>`
  position: fixed;
  left: 1rem;

  transition-property: left;
  transition-duration: ${transitionDuration};

  z-index: 1;

  ${(props) => props.showSidebar && `
    left: calc(${sidebarWidth} + 1rem);
  `}
`;

const PageContainer = styled.div<ISidebarAwareProps>`
  position: relative;

  padding: 0rem;
  width: 100%;
  height: 100%;
  overflow-y: auto;

  vertical-align: top;

  transition-property: padding;
  transition-duration: ${transitionDuration};

  padding-left: 1rem;

  ${(props) => props.showSidebar && `
    padding-left: calc(${sidebarWidth} + 1rem);
  `}
`;

const ContentContainer = styled.div`
  display: flex;
  max-width: 960px;
  min-height: 100vh;
  margin: auto;
  flex-direction: column;
  overflow-x: hidden;
  padding-top: calc(${headerBarHeight} + 10px);
`;

/**
 * A dashboard wrapper
 */
export const PageWrapper = () => {
  const [showSidebar, setShowSidebar] = useState(true);

  return (
    <PageSizedContainer>
        <SidebarContainer showSidebar={showSidebar}>
          <ConnectedSidebar />
        </SidebarContainer>
        <PageContainer showSidebar={showSidebar}>
          <HeaderBar showSidebar={showSidebar}>
            <SidebarBurgerContainer showSidebar={showSidebar}>
              <SidebarBurger onClick={() => setShowSidebar((value) => !value)} />
            </SidebarBurgerContainer>
          </HeaderBar>

          <ContentContainer>
            <ConnectedNotification />
            <Switch>
              <Route path={Routes.Dashboard} component={Dashboard} />
              <Route path={Routes.Users} component={Users} />
              <Route path={Routes.Statistics} component={Statistics} />
              <Route path={Routes.Activity} component={ConnectedActivity} />
              <Route path={Routes.Settings} component={Settings} />
              <Route component={PageNotFound} />
            </Switch>
          </ContentContainer>

        </PageContainer>
    </PageSizedContainer>
  );
};