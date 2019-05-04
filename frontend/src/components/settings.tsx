import * as React from "react";
import { ConnectedApplicationSettings } from "./application-settings";
import { ConnectedEmailSettings } from "./email-settings";
import { ConnectedFrontendSettings } from "./frontend-settings";
import { Heading } from "./headings";

/**
 * A settings dashboard to configure all parts of tilt.
 */
export const Settings = () => (
  <>
    <Heading>Settings</Heading>
    <ConnectedFrontendSettings />
    <ConnectedApplicationSettings />
    <ConnectedEmailSettings />
  </>
);
