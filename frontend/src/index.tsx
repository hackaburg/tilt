import * as React from "react";
import * as ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import { RoutedApp } from "./components/app";
import { LoginContextProvider } from "./contexts/login-context";
import { NotificationContextProvider } from "./contexts/notification-context";
import { SettingsContextProvider } from "./contexts/settings-context";
import { WebSocketContextProvider } from "./contexts/ws-context";

const container = document.getElementById("app");
const app = (
  <NotificationContextProvider>
    <SettingsContextProvider>
      <LoginContextProvider>
        <WebSocketContextProvider>
          <BrowserRouter>
            <RoutedApp />
          </BrowserRouter>
        </WebSocketContextProvider>
      </LoginContextProvider>
    </SettingsContextProvider>
  </NotificationContextProvider>
);

ReactDOM.render(app, container);
