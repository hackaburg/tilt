import * as React from "react";
import * as ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import { RoutedApp } from "./components/app";
import { documentBaseURL } from "./config";
import { LoginContextProvider } from "./contexts/login-context";
import { NotificationContextProvider } from "./contexts/notification-context";
import { SettingsContextProvider } from "./contexts/settings-context";

const baseURL = documentBaseURL.replace(/^https?:\/\/[^\/]*/, "");
const container = document.getElementById("app");
const app = (
  <React.StrictMode>
    <NotificationContextProvider>
      <SettingsContextProvider>
        <LoginContextProvider>
          <BrowserRouter basename={baseURL}>
            <RoutedApp />
          </BrowserRouter>
        </LoginContextProvider>
      </SettingsContextProvider>
    </NotificationContextProvider>
  </React.StrictMode>
);

ReactDOM.render(app, container);
