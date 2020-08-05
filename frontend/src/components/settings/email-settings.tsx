import styled from "@emotion/styled";
import * as React from "react";
import { useCallback } from "react";
import FlexView from "react-flexview";
import { EmailSettingsDTO } from "../../api/types/dto";
import { useSettingsContext } from "../../contexts/settings-context";
import { Code } from "../base/code";
import { Message } from "../base/message";
import { Placeholder } from "../base/placeholder";
import { Text } from "../base/text";
import { TextInput } from "../base/text-input";
import { EmailTemplateEditor } from "./email-template-editor";
import { SettingsSection } from "./settings-section";

const EmailTemplateEditorContainer = styled(FlexView)`
  padding-top: 1rem;
`;

/**
 * Settings to configure mail templates.
 */
export const EmailSettings = () => {
  const { settings, updateSettings, updateError } = useSettingsContext();
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
    (sender) => updateEmailSettings({ sender }),
    [updateEmailSettings, settings],
  );

  const handleVerifyEmailChange = useCallback(
    (verifyEmail) => updateEmailSettings({ verifyEmail }),
    [updateEmailSettings, settings],
  );

  const handleForgotPasswordEmailChange = useCallback(
    (forgotPasswordEmail) => updateEmailSettings({ forgotPasswordEmail }),
    [updateEmailSettings, settings],
  );

  return (
    <SettingsSection title="Mail settings">
      {updateError && (
        <Message error>
          <b>Error:</b> {updateError.message}
        </Message>
      )}

      <p>Emails sent out will contain the following sender address:</p>
      {!settings && <Placeholder width="100%" height="3rem" />}
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
        You may use Handlebars syntax to access variables injected into the
        template like <Code>email</Code>, but try to keep the emails short.
      </Text>
      <Text>
        tilt will inject the <Code>verifyToken</Code> into the verification
        email template. To actually verify users, supply the url to your hosted
        instance, e.g.{" "}
        <Code>{"https://hackathon.com/apply/verify#{{verifyToken}}"}</Code> -
        the frontend will expect the token to be at{" "}
        <Code>{"/verify#token"}</Code>.
      </Text>

      {!settings && (
        <>
          <Placeholder width="100%" height="10rem" />
          <br />
          <Placeholder width="100%" height="10rem" />
        </>
      )}

      {settings && (
        <>
          <EmailTemplateEditorContainer column>
            <EmailTemplateEditor
              title="Verification email"
              template={settings.email.verifyEmail}
              onTemplateChange={handleVerifyEmailChange}
            />
          </EmailTemplateEditorContainer>

          <EmailTemplateEditorContainer column>
            <EmailTemplateEditor
              title="Forgot password email"
              template={settings.email.forgotPasswordEmail}
              onTemplateChange={handleForgotPasswordEmailChange}
            />
          </EmailTemplateEditorContainer>
        </>
      )}
    </SettingsSection>
  );
};
