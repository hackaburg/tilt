import * as React from "react";
import * as ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { applyMiddleware, compose, createStore } from "redux";
import thunk from "redux-thunk";
import { RoutedApp } from "./components/app";
import { isProductionEnabled } from "./config";
import { LoginContextProvider } from "./contexts/login-context";
import { NotificationContextProvider } from "./contexts/notification-context";
import { SettingsContextProvider } from "./contexts/settings-context";
import { WebSocketContextProvider } from "./contexts/ws-context";
import { rootReducer } from "./reducers";

declare var window: {
  __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: (...args: any[]) => any;
};

const composeEnhancers =
  (!isProductionEnabled && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) ||
  compose;
const middleware = composeEnhancers(applyMiddleware(thunk));
const store = createStore(rootReducer, middleware);

const container = document.getElementById("app");
const app = (
  <NotificationContextProvider>
    <SettingsContextProvider>
      <LoginContextProvider>
        <WebSocketContextProvider>
          <Provider store={store}>
            <BrowserRouter>
              <RoutedApp />
            </BrowserRouter>
          </Provider>
        </WebSocketContextProvider>
      </LoginContextProvider>
    </SettingsContextProvider>
  </NotificationContextProvider>
);

ReactDOM.render(app, container);
