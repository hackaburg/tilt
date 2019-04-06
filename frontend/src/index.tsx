import * as React from "react";
import * as ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { applyMiddleware, compose, createStore } from "redux";
import thunk from "redux-thunk";
import { App } from "./components/app";
import { rootReducer } from "./reducers";

const middleware = compose(applyMiddleware(thunk));
const store = createStore(rootReducer, middleware);
const container = document.getElementById("app");
const app = (
  <Provider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>
);

ReactDOM.render(app, container);
