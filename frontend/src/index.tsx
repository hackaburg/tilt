import * as React from "react";
import * as ReactDOM from "react-dom";
import { App } from "./components/app";

const container = document.getElementById("app");
const app = (
  <App />
);

ReactDOM.render(app, container);
