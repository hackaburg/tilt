import styled from "@emotion/styled";
import * as React from "react";
import { StyleableFlexContainer } from "../base/flex";
import { Subheading } from "../base/headings";

const Section = styled(StyleableFlexContainer)`
  padding: 1rem 0;
`;

interface ISettingsSection {
  title: string;
  children: React.ReactNode;
}

/**
 * A section on the settings page.
 */
export const SettingsSection = ({ title, children }: ISettingsSection) => (
  <Section>
    <Subheading text={title} />
    {children}
  </Section>
);
