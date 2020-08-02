import styled from "@emotion/styled";
import * as React from "react";
import FlexView from "react-flexview";
import { Subheading } from "./headings";

const Section = styled(FlexView)`
  padding: 1rem 0;
`;

interface ISettingsSection {
  title: string;
  children: FlexView.Props["children"];
}

/**
 * A section on the settings page.
 */
export const SettingsSection = ({ title, children }: ISettingsSection) => (
  <Section column shrink={false}>
    <Subheading>{title}</Subheading>
    {children}
  </Section>
);
