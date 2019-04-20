import * as React from "react";
import { connect } from "react-redux";
import { bindActionCreators, Dispatch } from "redux";
import styled from "styled-components";
import { useDebouncedCallback } from "use-debounce";
import { IEmailSettings, IEmailTemplate } from "../../../types/settings";
import { updateEmailSettings } from "../actions/settings";
import { borderRadius, debounceDuration } from "../config";
import { IState } from "../state";
import { EmailTemplateEditor } from "./email-template-editor";
import { Subheading } from "./headings";

const Code = styled.span`
  padding: 0.1rem 0.2rem;
  font-family: Monaco, Consolata, Inconsolata, monospace;
  font-size: 0.75rem;
  background-color: #f7f7f7;
  border: 1px solid #eee;
  border-radius: ${borderRadius};
`;

interface IEmailSettingsProps {
  dispatchUpdateEmailSettings: typeof updateEmailSettings;
  email: IEmailSettings;
}

/**
 * Settings to configure mail templates.
 */
export const EmailSettings = ({ dispatchUpdateEmailSettings, email }: IEmailSettingsProps) => {
  const handleChange = (templateName: keyof typeof email, template: IEmailTemplate) => {
    dispatchUpdateEmailSettings({
      [templateName]: template,
    });
  };

  const [debouncedHandleChange] = useDebouncedCallback(handleChange, debounceDuration, []);

  return (
    <>
      <Subheading>Mail settings</Subheading>
      <p>
        Here you can configure the email templates used to send to applicants. Both the HTML and plain text templates will be sent in a single mail.
        <br />
        You may use Handlebars syntax to access variables injected into the template like <Code>verifyUrl</Code>, <Code>email</Code> or <Code>questions.id</Code>.
      </p>
      <EmailTemplateEditor
        title="Verification"
        template={email.verifyEmail}
        onTemplateChange={(template) => debouncedHandleChange("verifyEmail", template)}
      />
      <EmailTemplateEditor
        title="Forgot password"
        template={email.forgotPasswordEmail}
        onTemplateChange={(template) => debouncedHandleChange("forgotPasswordEmail", template)}
      />
    </>
  );
};

const mapStateToProps = (state: IState) => ({
  email: state.settings.email,
});

const mapDispatchToProps = (dispatch: Dispatch) => {
  return bindActionCreators({
    dispatchUpdateEmailSettings: updateEmailSettings,
  }, dispatch);
};

/**
 * The email settings connected to the redux store.
 */
export const ConnectedEmailSettings = connect(mapStateToProps, mapDispatchToProps)(EmailSettings);
