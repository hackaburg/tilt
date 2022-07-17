import styled from "@emotion/styled";
import * as React from "react";
import { useCallback } from "react";
import { EmailSettingsDTO } from "../../api/types/dto";
import { useSettingsContext } from "../../contexts/settings-context";
import { Code } from "../base/code";
import { StyleableFlexContainer } from "../base/flex";
import { Placeholder } from "../base/placeholder";
import { Text } from "../base/text";
import { TextInput } from "../base/text-input";
import { EmailTemplateEditor } from "./email-template-editor";
import { SettingsSection } from "./settings-section";

const EmailTemplateEditorContainer = styled(StyleableFlexContainer)`
  padding-top: 1rem;
`;

/**
 * Settings to configure mail templates.
 */
export const EmailSettings = () => {
  const { settings, updateSettings } = useSettingsContext();
  const updateEmailSettings = useCallback(
    (changes: Partial<EmailSettingsDTO>) => {
      updateSettings({
        ...settings,
        email: {
          ...settings.email,
          ...changes,
        },
      });
    },
    [updateSettings, settings],
  );

  const handleSenderChange = useCallback(
    (sender: string) => updateEmailSettings({ sender }),
    [updateEmailSettings, settings],
  );

  const handleVerifyEmailChange = useCallback(
    (verifyEmail: EmailSettingsDTO["verifyEmail"]) =>
      updateEmailSettings({ verifyEmail }),
    [updateEmailSettings, settings],
  );

  const handleAdmittedEmailChange = useCallback(
    (admittedEmail: EmailSettingsDTO["admittedEmail"]) =>
      updateEmailSettings({ admittedEmail }),
    [updateEmailSettings, settings],
  );

  return (
    <SettingsSection title="Mail settings">
      <p>Emails sent out will contain the following sender address:</p>
      {!settings && <Placeholder height="3rem" />}
      {settings && (
        <TextInput
          value={settings.email.sender}
          onChange={handleSenderChange}
          title="From"
          placeholder="applications@your-hackathon.org"
        />
      )}

      <Text>
        Use the editors to configure the email templates sent to applicants. The
        HTML and plain text templates will be sent in the same mail.
        <br />
        You may use <Code>{"{{variable}}"}</Code> syntax to access variables
        injected into the template like <Code>{"{{verifyToken}}"}</Code>.
      </Text>
      <Text>
        tilt will inject the <Code>verifyToken</Code> into the verification
        email template. To actually verify users, supply the url to your hosted
        instance, e.g.{" "}
        <Code>{"https://hackathon.com/apply/verify#{{verifyToken}}"}</Code> -
        the frontend will expect the URL to look like this:
        <Code>{"/verify#Th3aCtUaL93n3r4t3dT0KeN"}</Code>
      </Text>

      {!settings && (
        <>
          <Placeholder height="10rem" />
          <br />
          <Placeholder height="10rem" />
        </>
      )}

      {settings && (
        <>
          <EmailTemplateEditorContainer>
            <EmailTemplateEditor
              title="Verification email"
              template={settings.email.verifyEmail}
              onTemplateChange={handleVerifyEmailChange}
            />
          </EmailTemplateEditorContainer>

          <EmailTemplateEditorContainer>
            <EmailTemplateEditor
              title="Admitted email"
              template={settings.email.admittedEmail}
              onTemplateChange={handleAdmittedEmailChange}
            />
          </EmailTemplateEditorContainer>
        </>
      )}
    </SettingsSection>
  );
};
