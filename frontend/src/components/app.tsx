import * as React from "react";
import { useEffect } from "react";
import { connect } from "react-redux";
import { Route, RouteComponentProps, Switch, withRouter } from "react-router";
import { bindActionCreators, Dispatch } from "redux";
import { ThemeProvider } from "styled-components";
import { IFrontendSettings } from "../../../types/settings";
import { boot as bootRaw } from "../actions/boot";
import { isLoginTokenSet } from "../authentication";
import { Routes } from "../routes";
import { IState } from "../state";
import { ITheme } from "../theme";
import { Dashboard } from "./dashboard";
import { ConnectedLoginSignupForm } from "./login-signup-form";

interface IAppProps extends RouteComponentProps<any> {
  settings: IFrontendSettings;
  boot: typeof bootRaw;
}

/**
 * The main app component.
 */
export const App = ({ settings, boot, history }: IAppProps) => {
  useEffect(() => {
    boot();
  }, []);

  const isLoggedIn = isLoginTokenSet();
  useEffect(() => {
    if (!isLoggedIn) {
      history.push(Routes.Login);
    } else if (history.location.pathname === Routes.Login) {
      history.push(Routes.Dashboard);
    }
  }, [isLoggedIn]);

  const theme: ITheme = {
    colorGradientEnd: settings.colorGradientEnd,
    colorGradientStart: settings.colorGradientStart,
    colorLink: settings.colorLink,
    colorLinkHover: settings.colorLinkHover,
  };

  return (
    <ThemeProvider theme={theme}>
      <Switch>
        <Route path={Routes.Login} component={ConnectedLoginSignupForm} />
        <Route component={Dashboard} />
      </Switch>
    </ThemeProvider>
  );
};

const mapStateToProps = (state: IState) => ({
  settings: state.settings.frontend,
});

const mapDispatchToProps = (dispatch: Dispatch) => {
  return bindActionCreators({
    boot: bootRaw,
  }, dispatch);
};

/**
 * The main app component, connected to the redux store.
 */
export const ConnectedApp = connect(mapStateToProps, mapDispatchToProps)(App);

/**
 * The main app component, connected to the redux store and react-router.
 */
export const RoutedConnectedApp = withRouter(ConnectedApp);
