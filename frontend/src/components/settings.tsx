import * as React from "react";
import { ApplicationSettings } from "./application-settings";
import { EmailSettings } from "./email-settings";
import { FrontendSettings } from "./frontend-settings";
import { Heading } from "./headings";

/**
 * A settings dashboard to configure all parts of tilt.
 */
export const Settings = () => (
  <>
    <Heading>Settings</Heading>
    <FrontendSettings />
    <ApplicationSettings />
    <EmailSettings />
  </>
);
