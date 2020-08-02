import * as React from "react";
import * as ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import { RoutedApp } from "./components/app";
import { LoginContextProvider } from "./contexts/login-context";
import { NotificationContextProvider } from "./contexts/notification-context";
import { SettingsContextProvider } from "./contexts/settings-context";

const container = document.getElementById("app");
const app = (
  <React.StrictMode>
    <NotificationContextProvider>
      <SettingsContextProvider>
        <LoginContextProvider>
          <BrowserRouter>
            <RoutedApp />
          </BrowserRouter>
        </LoginContextProvider>
      </SettingsContextProvider>
    </NotificationContextProvider>
  </React.StrictMode>
);

ReactDOM.render(app, container);
