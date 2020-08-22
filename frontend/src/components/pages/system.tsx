import * as React from "react";
import { Heading } from "../base/headings";
import { Page } from "./page";

/**
 * A page to export all user data and to prune the system data.
 */
export const System = () => {
  return (
    <Page>
      <Heading text="System" />
    </Page>
  );
};
