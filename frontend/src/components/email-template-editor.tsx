import * as React from "react";
import { useState } from "react";
import styled, { css} from "styled-components";
import { IEmailTemplate } from "../../../types/settings";
import { borderRadius } from "../config";
import { Editor } from "./editor";
import { Placeholder } from "./placeholder";
import { SegmentButton } from "./segment-button";

const editorContainerStyle = css`
  margin: 1rem 0rem;

  box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.05);
  border-radius: ${borderRadius};
  overflow: hidden;
`;

const DropShadowContainer = styled.div`
  ${editorContainerStyle}
  padding: 1rem;
`;

const Title = styled.h3`
  margin-top: 0rem;
  margin-bottom: 1rem;
  font-weight: lighter;
`;

const ButtonContainer = styled.div`
  display: inline-block;
  margin-left: 1rem;
  position: relative;
  top: 0.15rem;
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
export const EmailTemplateEditor = ({ title, template, onTemplateChange }: IEmailTemplateEditor) => {
  const [htmlTemplate, setHtmlTemplate] = useState(template.htmlTemplate);
  const [textTemplate, setTextTemplate] = useState(template.textTemplate);
  const [language, setLanguage] = useState(EditorLanguage.HTML);

  const displayedValue = language === EditorLanguage.HTML ? htmlTemplate : textTemplate;
  const onChange = (value: string) => {
    if (language === EditorLanguage.HTML) {
      setHtmlTemplate(value);
      onTemplateChange({
        htmlTemplate: value,
        textTemplate,
      });
    } else {
      setTextTemplate(value);
      onTemplateChange({
        htmlTemplate,
        textTemplate: value,
      });
    }
  };

  return (
    <DropShadowContainer>
      <Title>
        {title}
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
        onChange={onChange}
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
