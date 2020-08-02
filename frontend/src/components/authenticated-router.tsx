import * as React from "react";
import { useCallback, useState } from "react";
import FlexView from "react-flexview";
import { Route, Switch } from "react-router";
import { sidebarWidth, transitionDuration } from "../config";
import { Routes } from "../routes";
import { LazyAdmissionCenter } from "./lazy-admission-center";
import { LazySettings } from "./lazy-settings";
import { PageNotFound } from "./page-not-found";
import { ProfileForm } from "./profile-form";
import { Sidebar } from "./sidebar";
import { SidebarToggle } from "./sidebar-toggle";

/**
 * A router for authenticated users.
 */
export const AuthenticatedRouter = () => {
  const [showSidebar, setShowSidebar] = useState(true);
  const toggleSidebar = useCallback(() => {
    setShowSidebar((value) => !value);
  }, []);

  return (
    <FlexView height="100vh">
      <FlexView
        id="sidebar-container"
        column
        shrink={false}
        style={{
          transitionDuration,
          transitionProperty: "width",
          width: showSidebar ? sidebarWidth : 0,
        }}
      >
        <Sidebar />
      </FlexView>

      <FlexView vAlignContent="top" shrink={false}>
        <SidebarToggle onClick={toggleSidebar} />
      </FlexView>

      <FlexView grow>
        <Switch>
          <Route path={Routes.Settings} component={LazySettings} />
          <Route path={Routes.ProfileForm} component={ProfileForm} />
          <Route
            path={Routes.AdmissionCenter}
            component={LazyAdmissionCenter}
          />
          <Route component={PageNotFound} />
        </Switch>
      </FlexView>
    </FlexView>
  );
};
