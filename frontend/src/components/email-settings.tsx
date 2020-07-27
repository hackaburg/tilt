import styled from "@emotion/styled";
import * as React from "react";
import { useDebouncedCallback } from "use-debounce";
import type { EmailSettingsDTO, EmailTemplateDTO } from "../api/types/dto";
import { borderRadius, debounceDuration } from "../config";
import { useSettingsContext } from "../contexts/settings-context";
import {
  EmailTemplateEditor,
  EmailTemplateEditorPlaceholder,
} from "./email-template-editor";
import { Subheading } from "./headings";
import { Message } from "./message";
import { Placeholder } from "./placeholder";
import { StatefulTextInput } from "./text-input";

const Code = styled.span`
  padding: 0.1rem 0.2rem;
  font-family: Monaco, Consolata, Inconsolata, monospace;
  font-size: 0.75rem;
  background-color: #f7f7f7;
  border: 1px solid #eee;
  border-radius: ${borderRadius};
`;

/**
 * Settings to configure mail templates.
 */
export const EmailSettings = () => {
  const { settings, updateSettings, updateError } = useSettingsContext();

  const [debouncedHandleSettingsChange] = useDebouncedCallback(
    (field: keyof EmailSettingsDTO, value: string | EmailTemplateDTO) => {
      updateSettings({
        ...settings,
        email: {
          ...settings.email,
          [field]: value,
        },
      });
    },
    debounceDuration,
    [updateSettings, settings],
  );

  return (
    <>
      <Subheading>Mail settings</Subheading>
      {updateError && (
        <Message error>
          <b>Error:</b> {updateError.message}
        </Message>
      )}

      <p>Emails sent out will contain the following sender address:</p>
      {!settings && <Placeholder width="100%" height="3rem" />}
      {settings && (
        <StatefulTextInput
          initialValue={settings.email.sender}
          onChange={(value) => debouncedHandleSettingsChange("sender", value)}
          title="From"
          placeholder="applications@your-hackathon.org"
        />
      )}

      <p>
        Use the editors to configure the email templates sent to applicants. The
        HTML and plain text templates will be sent in the same mail.
        <br />
        You may use Handlebars syntax to access variables injected into the
        template like <Code>email</Code> or <Code>questions.id</Code>.
      </p>
      <p>
        tilt will inject the <Code>verifyToken</Code> into the verification
        email template. To actually verify users, supply the url to your hosted
        instance, e.g.{" "}
        <Code>{"https://hackathon.com/apply/verify#{{verifyToken}}"}</Code> -
        the frontend will expect the token to be at{" "}
        <Code>{"/verify#token"}</Code>.
      </p>

      {!settings && (
        <>
          <EmailTemplateEditorPlaceholder />
          <EmailTemplateEditorPlaceholder />
        </>
      )}

      {settings && (
        <>
          <EmailTemplateEditor
            title="Verification"
            template={settings.email.verifyEmail}
            onTemplateChange={(template) =>
              debouncedHandleSettingsChange("verifyEmail", template)
            }
          />
          <EmailTemplateEditor
            title="Forgot password"
            template={settings.email.forgotPasswordEmail}
            onTemplateChange={(template) =>
              debouncedHandleSettingsChange("forgotPasswordEmail", template)
            }
          />
        </>
      )}
    </>
  );
};
