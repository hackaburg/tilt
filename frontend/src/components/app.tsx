import * as React from "react";
import { useCallback, useEffect } from "react";
import { Route, RouteComponentProps, Switch, withRouter } from "react-router";
import { ThemeProvider } from "styled-components";
import { defaultThemeColor } from "../config";
import { useLoginContext } from "../contexts/login-context";
import { useSettingsContext } from "../contexts/settings-context";
import { Routes } from "../routes";
import { ITheme } from "../theme";
import { LoginSignupForm } from "./login-signup-form";
import { PageWrapper } from "./page-wrapper";
import { VerifyEmail } from "./verify-email";

interface IAppProps extends RouteComponentProps<any> {}

/**
 * The main app component.
 */
export const App = ({ history, location }: IAppProps) => {
  const { isLoggedIn } = useLoginContext();
  const { hash, pathname } = location;

  useEffect(() => {
    if (isLoggedIn) {
      if (pathname === Routes.Login) {
        history.push(Routes.Dashboard);
      }
    } else {
      if (pathname !== Routes.VerifyEmail) {
        history.push(Routes.Login);
      }
    }
  }, [isLoggedIn, pathname]);

  const VerifyEmailWithToken = useCallback(() => <VerifyEmail token={hash} />, [
    hash,
  ]);

  let theme: ITheme = {
    colorGradientEnd: defaultThemeColor,
    colorGradientStart: defaultThemeColor,
    colorLink: defaultThemeColor,
    colorLinkHover: defaultThemeColor,
  };

  const { settings } = useSettingsContext();

  if (settings) {
    theme = {
      colorGradientEnd: settings.frontend.colorGradientEnd,
      colorGradientStart: settings.frontend.colorGradientStart,
      colorLink: settings.frontend.colorLink,
      colorLinkHover: settings.frontend.colorLinkHover,
    };
  }

  return (
    <ThemeProvider theme={theme}>
      <Switch>
        <Route path={Routes.Login} component={LoginSignupForm} />
        <Route path={Routes.VerifyEmail} component={VerifyEmailWithToken} />
        <Route component={PageWrapper} />
      </Switch>
    </ThemeProvider>
  );
};

/**
 * The main app component, connected to the redux store and react-router.
 */
export const RoutedApp = withRouter(App);
