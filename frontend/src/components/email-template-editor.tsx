import * as React from "react";
import { useState } from "react";
import styled from "styled-components";
import { borderRadius } from "../config";
import { Editor } from "./editor";
import { SegmentButton } from "./segment-button";

const DropShadowContainer = styled.div`
  margin: 1rem 0rem;
  padding: 1rem;

  box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.05);
  border-radius: ${borderRadius};
  overflow: hidden;
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
 * The mode the editor currently is in.
 */
enum EditorMode {
  HTML = "html",
  Text = "text",
}

interface IEmailTemplateEditor {
  title: string;
  htmlTemplate: string;
  onHtmlTemplateChange: (value: string) => any;
  textTemplate: string;
  onTextTemplateChange: (value: string) => any;
}

/**
 * An editor to modify email templates.
 */
export const EmailTemplateEditor = ({ title, htmlTemplate, onHtmlTemplateChange, textTemplate, onTextTemplateChange }: IEmailTemplateEditor) => {
  const [editor, setEditor] = useState(EditorMode.HTML);
  const value = editor === EditorMode.HTML ? htmlTemplate : textTemplate;
  const onChange = editor === EditorMode.HTML ? onHtmlTemplateChange : onTextTemplateChange;

  return (
    <DropShadowContainer>
      <Title>
        {title}
        <ButtonContainer>
          <SegmentButton choices={[EditorMode.HTML, EditorMode.Text]} onChoiceChanged={(choice) => setEditor(choice as EditorMode)} />
        </ButtonContainer>
      </Title>
      <Editor language={editor} value={value} onChange={onChange} />
    </DropShadowContainer>
  );
};
