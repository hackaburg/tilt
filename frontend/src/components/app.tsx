import * as React from "react";
import { useEffect } from "react";
import { connect } from "react-redux";
import { bindActionCreators, Dispatch } from "redux";
import { ThemeProvider } from "styled-components";
import { IFrontendSettings } from "../../../types/settings";
import { fetchSettings as fetchSettingsRaw } from "../actions/settings";
import { IState } from "../state";
import { ITheme } from "../theme";
import { ConnectedLoginSignupForm } from "./login-signup-form";

interface IAppProps {
  settings: IFrontendSettings;
  fetchSettings: typeof fetchSettingsRaw;
}

/**
 * The main app component.
 */
export const App = ({ settings, fetchSettings }: IAppProps) => {
  useEffect(() => {
    fetchSettings();
  }, []);

  const theme: ITheme = {
    colorGradientEnd: settings.colorGradientEnd,
    colorGradientStart: settings.colorGradientStart,
    colorLink: settings.colorLink,
    colorLinkHover: settings.colorLinkHover,
  };

  return (
    <ThemeProvider theme={theme}>
      <ConnectedLoginSignupForm />
    </ThemeProvider>
  );
};

const mapStateToProps = (state: IState) => ({
  settings: state.settings.data.frontend,
});

const mapDispatchToProps = (dispatch: Dispatch) => {
  return bindActionCreators({
    fetchSettings: fetchSettingsRaw,
  }, dispatch);
};

/**
 * The main app component, connected to the redux store.
 */
export const ConnectedApp = connect(mapStateToProps, mapDispatchToProps)(App);
