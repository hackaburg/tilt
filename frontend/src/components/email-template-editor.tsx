import { css } from "@emotion/core";
import styled from "@emotion/styled";
import * as React from "react";
import { useState } from "react";
import { IEmailTemplate } from "../../../types/settings";
import { borderRadius } from "../config";
import { Editor } from "./editor";
import { Placeholder } from "./placeholder";
import { SegmentButton } from "./segment-button";
import { TextInput } from "./text-input";

const editorContainerStyle = css`
  margin: 1rem 0rem;

  box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.05);
  border-radius: ${borderRadius};
  overflow: hidden;
`;

const DropShadowContainer = styled.div`
  ${editorContainerStyle}
  padding: 1rem;
  position: relative;
`;

const Title = styled.h3`
  margin-top: 0rem;
  margin-bottom: 1rem;
  font-weight: lighter;
`;

const ButtonContainer = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
`;

/**
 * The language the editor currently is in.
 */
enum EditorLanguage {
  HTML = "html",
  Text = "text",
}

interface IEmailTemplateEditor {
  title: string;
  template: IEmailTemplate;
  onTemplateChange: (template: IEmailTemplate) => any;
}

/**
 * An editor to modify email templates.
 */
export const EmailTemplateEditor = ({
  title,
  template,
  onTemplateChange,
}: IEmailTemplateEditor) => {
  const [subject, setSubject] = useState(template.subject);
  const [htmlTemplate, setHtmlTemplate] = useState(template.htmlTemplate);
  const [textTemplate, setTextTemplate] = useState(template.textTemplate);
  const [language, setLanguage] = useState(EditorLanguage.HTML);

  const displayedValue =
    language === EditorLanguage.HTML ? htmlTemplate : textTemplate;
  const onBodyChange = (value: string) => {
    if (language === EditorLanguage.HTML) {
      setHtmlTemplate(value);
      onTemplateChange({
        htmlTemplate: value,
        subject,
        textTemplate,
      });
    } else {
      setTextTemplate(value);
      onTemplateChange({
        htmlTemplate,
        subject,
        textTemplate: value,
      });
    }
  };

  const onSubjectChange = (value: string) => {
    setSubject(value);
    onTemplateChange({
      htmlTemplate,
      subject: value,
      textTemplate,
    });
  };

  return (
    <DropShadowContainer>
      <Title>
        <TextInput
          value={subject}
          onChange={onSubjectChange}
          title={`${title} subject`}
          placeholder="e.g. 'win free money'"
        />
        <ButtonContainer>
          <SegmentButton
            choices={[EditorLanguage.HTML, EditorLanguage.Text]}
            onChoiceChanged={(choice) => setLanguage(choice as EditorLanguage)}
          />
        </ButtonContainer>
      </Title>
      <Editor
        language={language}
        value={displayedValue}
        onChange={onBodyChange}
      />
    </DropShadowContainer>
  );
};

const PlaceholderContainer = styled(Placeholder)`
  ${editorContainerStyle}
`;

/**
 * A placeholder version of an email tempalte editor. Essentially a gray block the size of the editor.
 */
export const EmailTemplateEditorPlaceholder = () => (
  <PlaceholderContainer width="100%" height="45vh" />
);
