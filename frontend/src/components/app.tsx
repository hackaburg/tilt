import * as React from "react";
import { useEffect } from "react";
import { RouteComponentProps, withRouter } from "react-router";
import { defaultThemeColor } from "../config";
import { useLoginContext } from "../contexts/login-context";
import { useSettingsContext } from "../contexts/settings-context";
import { Routes } from "../routes";
import { ThemeProvider } from "../theme";
import { ErrorBoundary } from "./base/error-boundary";
import { LazyAuthenticatedRouter } from "./routers/lazy-authenticated-router";
import { UnauthenticatedRouter } from "./routers/unauthenticated-router";

interface IAppProps extends RouteComponentProps<any> {}

/**
 * The main app component.
 */
export const App = ({ history, location }: IAppProps) => {
  const { isLoggedIn } = useLoginContext();
  const { pathname } = location;

  useEffect(() => {
    if (isLoggedIn) {
      if (pathname === Routes.Login) {
        history.push(Routes.Status);
      }
    } else {
      if (pathname !== Routes.VerifyEmail) {
        history.push(Routes.Login);
      }
    }
  }, [isLoggedIn, pathname]);

  let theme = {
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

  const router = isLoggedIn ? (
    <LazyAuthenticatedRouter />
  ) : (
    <UnauthenticatedRouter />
  );

  return (
    <ThemeProvider values={theme}>
      <ErrorBoundary>{router}</ErrorBoundary>
    </ThemeProvider>
  );
};

/**
 * The main app component, connected to react-router.
 */
export const RoutedApp = withRouter(App);
