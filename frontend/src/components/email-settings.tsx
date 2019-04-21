import * as React from "react";
import { connect } from "react-redux";
import { bindActionCreators, Dispatch } from "redux";
import styled from "styled-components";
import { useDebouncedCallback } from "use-debounce";
import { IEmailSettings, IEmailTemplate, IEmailTemplates } from "../../../types/settings";
import { updateEmailSettings, updateEmailTemplates } from "../actions/settings";
import { borderRadius, debounceDuration } from "../config";
import { IState } from "../state";
import { EmailTemplateEditor, EmailTemplateEditorPlaceholder } from "./email-template-editor";
import { Subheading } from "./headings";
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
  dispatchUpdateEmailTemplates: typeof updateEmailTemplates;
  dispatchUpdateEmailSettings: typeof updateEmailSettings;
  settings: IState["settings"];
}

/**
 * Settings to configure mail templates.
 */
export const EmailSettings = ({ dispatchUpdateEmailTemplates, dispatchUpdateEmailSettings, settings }: IEmailSettingsProps) => {
  const handleTemplateChange = (templateName: keyof IEmailTemplates, template: IEmailTemplate) => {
    dispatchUpdateEmailTemplates({
      [templateName]: template,
    });
  };

  const handleSettingsChange = (field: keyof IEmailSettings, value: string) => {
    dispatchUpdateEmailSettings({
      [field]: value,
    });
  };

  const [debouncedHandleTemplateChange] = useDebouncedCallback(handleTemplateChange, debounceDuration, []);
  const [debouncedHandleSettingsChange] = useDebouncedCallback(handleSettingsChange, debounceDuration, []);

  return (
    <>
      <Subheading>Mail settings</Subheading>
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
            template={settings.email.templates.verifyEmail}
            onTemplateChange={(template) => debouncedHandleTemplateChange("verifyEmail", template)}
          />
          <EmailTemplateEditor
            title="Forgot password"
            template={settings.email.templates.forgotPasswordEmail}
            onTemplateChange={(template) => debouncedHandleTemplateChange("forgotPasswordEmail", template)}
          />
        </>
      )}
    </>
  );
};

const mapStateToProps = (state: IState) => ({
  settings: state.settings,
});

const mapDispatchToProps = (dispatch: Dispatch) => {
  return bindActionCreators({
    dispatchUpdateEmailSettings: updateEmailSettings,
    dispatchUpdateEmailTemplates: updateEmailTemplates,
  }, dispatch);
};

/**
 * The email settings connected to the redux store.
 */
export const ConnectedEmailSettings = connect(mapStateToProps, mapDispatchToProps)(EmailSettings);
