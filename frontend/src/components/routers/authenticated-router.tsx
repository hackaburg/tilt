import * as React from "react";
import { useCallback, useState } from "react";
import FlexView from "react-flexview";
import { Route, Switch } from "react-router";
import { sidebarWidth, transitionDuration } from "../../config";
import { Routes } from "../../routes";
import { ConfirmationForm } from "../pages/confirmation-form";
import { LazyAdmission } from "../pages/lazy-admission";
import { LazySettings } from "../pages/lazy-settings";
import { PageNotFound } from "../pages/page-not-found";
import { ProfileForm } from "../pages/profile-form";
import { Status } from "../pages/status";
import { Sidebar } from "./sidebar/sidebar";
import { SidebarToggle } from "./sidebar/sidebar-toggle";

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
          <Route path={Routes.Status} component={Status} />
          <Route path={Routes.Settings} component={LazySettings} />
          <Route path={Routes.ProfileForm} component={ProfileForm} />
          <Route path={Routes.ConfirmationForm} component={ConfirmationForm} />
          <Route path={Routes.Admission} component={LazyAdmission} />
          <Route component={PageNotFound} />
        </Switch>
      </FlexView>
    </FlexView>
  );
};
