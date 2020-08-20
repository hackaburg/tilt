import * as React from "react";
import { Divider } from "../base/divider";
import { Heading } from "../base/headings";
import { ApplicationSettings } from "../settings/application-settings";
import { EmailSettings } from "../settings/email-settings";
import { FrontendSettings } from "../settings/frontend-settings";
import { Page } from "./page";

/**
 * A settings dashboard to configure all parts of tilt.
 */
export const Settings = () => (
  <Page>
    <Heading text="Settings" />
    <Divider />
    <FrontendSettings />
    <Divider />
    <ApplicationSettings />
    <Divider />
    <EmailSettings />
  </Page>
);
