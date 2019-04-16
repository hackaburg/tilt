import * as React from "react";
import { useState } from "react";
import { Route, Switch } from "react-router";
import styled from "styled-components";
import { sidebarWidth, transitionDuration } from "../config";
import { PageSizedContainer } from "./centering";
import { ConnectedNotification } from "./notification";
import { PageNotFound } from "./page-not-found";
import { ConnectedSidebar } from "./sidebar";
import { SidebarBurger } from "./sidebar-burger";

interface ISidebarAwareProps {
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
  top: 0.75rem;
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

  ${(props) => props.showSidebar && `
    padding-left: ${sidebarWidth};
  `}
`;

const ContentContainer = styled.div`
  display: flex;
  max-width: 960px;
  min-height: 100vh;
  margin: auto;
  flex-direction: column;
`;

/**
 * A dashboard wrapper
 */
export const Dashboard = () => {
  const [showSidebar, setShowSidebar] = useState(true);

  return (
    <PageSizedContainer>
        <SidebarContainer showSidebar={showSidebar}>
          <ConnectedSidebar />
        </SidebarContainer>
        <PageContainer showSidebar={showSidebar}>
          <SidebarBurgerContainer showSidebar={showSidebar}>
            <SidebarBurger onClick={() => setShowSidebar((value) => !value)} />
          </SidebarBurgerContainer>

          <ContentContainer>
            <ConnectedNotification />
            <Switch>
              <Route component={PageNotFound} />
            </Switch>
          </ContentContainer>
        </PageContainer>
    </PageSizedContainer>
  );
};
