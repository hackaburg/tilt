import * as React from "react";
import { ConnectedEmailSettings } from "./email-settings";
import { Heading } from "./headings";

/**
 * A settings dashboard to configure all parts of tilt.
 */
export const Settings = () => (
  <>
    <Heading>Settings</Heading>
    <ConnectedEmailSettings />
  </>
);
