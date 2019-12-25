import * as React from "react";
import * as ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { applyMiddleware, compose, createStore } from "redux";
import thunk from "redux-thunk";
import { RoutedApp } from "./components/app";
import { apiBaseUrl, isProductionEnabled } from "./config";
import { LoginContextProvider } from "./contexts/login-context";
import { NotificationContextProvider } from "./contexts/notification-context";
import { SettingsContextProvider } from "./contexts/settings-context";
import { rootReducer } from "./reducers";
import { WebSocketHandler } from "./ws";
import { ActivityWebSocketHandler } from "./ws/activity-handler";

declare var window: {
  __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: (...args: any[]) => any;
};

const composeEnhancers =
  (!isProductionEnabled && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) ||
  compose;
const middleware = composeEnhancers(applyMiddleware(thunk));
const store = createStore(rootReducer, middleware);

let ws: WebSocketHandler | null = null;
store.subscribe(() => {
  const { role } = store.getState();

  if (role && !ws) {
    ws = new WebSocketHandler(apiBaseUrl);
    ws.registerMessageHandler(
      new ActivityWebSocketHandler((action) => store.dispatch(action)),
    );
  } else if (!role && ws) {
    ws.close();
    ws = null;
  }
});

const container = document.getElementById("app");
const app = (
  <NotificationContextProvider>
    <SettingsContextProvider>
      <LoginContextProvider>
        <Provider store={store}>
          <BrowserRouter>
            <RoutedApp />
          </BrowserRouter>
        </Provider>
      </LoginContextProvider>
    </SettingsContextProvider>
  </NotificationContextProvider>
);

ReactDOM.render(app, container);
