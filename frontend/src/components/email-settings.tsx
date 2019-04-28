import * as React from "react";
import { connect } from "react-redux";
import { bindActionCreators, Dispatch } from "redux";
import styled from "styled-components";
import { useDebouncedCallback } from "use-debounce";
import { IEmailSettings, IEmailTemplate } from "../../../types/settings";
import { updateSettings } from "../actions/settings";
import { borderRadius, debounceDuration } from "../config";
import { FormType, IState } from "../state";
import { EmailTemplateEditor, EmailTemplateEditorPlaceholder } from "./email-template-editor";
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

interface IEmailSettingsProps {
  dispatchUpdateSettings: typeof updateSettings;
  settings: IState["settings"];
  error?: string | false;
}

/**
 * Settings to configure mail templates.
 */
export const EmailSettings = ({ dispatchUpdateSettings, settings, error }: IEmailSettingsProps) => {
  const handleSettingsChange = (field: keyof IEmailSettings, value: string | IEmailTemplate) => {
    dispatchUpdateSettings(FormType.MailSettings, {
      email: {
        [field]: value,
      },
    });
  };

  const [debouncedHandleSettingsChange] = useDebouncedCallback(handleSettingsChange, debounceDuration, []);

  return (
    <>
      <Subheading>Mail settings</Subheading>
      {error && (
        <Message error><b>Error:</b> {error}</Message>
      )}

      <p>Emails sent out will contain the following sender address:</p>
      {!settings && (
        <Placeholder width="100%" height="3rem" />
      )}
      {settings && (
        <StatefulTextInput
          initialValue={settings.email.sender}
          onChange={(value) => debouncedHandleSettingsChange("sender", value)}
          title="From"
          placeholder="applications@your-hackathon.org"
        />
      )}

      <p>
        Use the editors to configure the email templates sent to applicants. The HTML and plain text templates will be sent in the same mail.
        <br />
        You may use Handlebars syntax to access variables injected into the template like <Code>verifyUrl</Code>, <Code>email</Code> or <Code>questions.id</Code>.
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
            onTemplateChange={(template) => debouncedHandleSettingsChange("verifyEmail", template)}
          />
          <EmailTemplateEditor
            title="Forgot password"
            template={settings.email.forgotPasswordEmail}
            onTemplateChange={(template) => debouncedHandleSettingsChange("forgotPasswordEmail", template)}
          />
        </>
      )}
    </>
  );
};

const mapStateToProps = (state: IState) => ({
  error: state.form.type === FormType.MailSettings && state.request.error,
  settings: state.settings,
});

const mapDispatchToProps = (dispatch: Dispatch) => {
  return bindActionCreators({
    dispatchUpdateSettings: updateSettings,
  }, dispatch);
};

/**
 * The email settings connected to the redux store.
 */
export const ConnectedEmailSettings = connect(mapStateToProps, mapDispatchToProps)(EmailSettings);
