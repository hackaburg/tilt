import { css } from "@emotion/core";
import styled from "@emotion/styled";
import * as React from "react";
import { useCallback, useRef } from "react";
import type { EmailTemplateDTO } from "../api/types/dto";
import { borderRadius } from "../config";
import { Col, Row } from "./grid";
import { Placeholder } from "./placeholder";
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

const EditorTitle = styled.h4`
  margin: 0;
  margin-bottom: 0.5rem;
`;

const Editor = styled.textarea`
  display: inline-block;
  width: 100%;
  height: 15rem;
  resize: none;
  font-size: inherit;
  font-family: monospace;
  border: none;
`;

interface IEmailTemplateEditor {
  title: string;
  template: EmailTemplateDTO;
  onTemplateChange: (template: EmailTemplateDTO) => any;
}

/**
 * An editor to modify email templates.
 */
export const EmailTemplateEditor = ({
  title,
  template,
  onTemplateChange,
}: IEmailTemplateEditor) => {
  const onChangeRef = useRef(onTemplateChange);
  onChangeRef.current = onTemplateChange;

  const onSubjectChange = useCallback(
    (event) => {
      onTemplateChange({
        ...template,
        subject: event.target.value,
      });
    },
    [onTemplateChange, template],
  );

  const onHtmlTemplateChange = useCallback(
    (event) => {
      onTemplateChange({
        ...template,
        htmlTemplate: event.target.value,
      });
    },
    [onTemplateChange, template],
  );

  const onTextTemplateChange = useCallback(
    (event) => {
      onTemplateChange({
        ...template,
        textTemplate: event.target.value,
      });
    },
    [onTemplateChange, template],
  );

  return (
    <DropShadowContainer>
      <Title>
        <TextInput
          value={template.subject}
          onChange={onSubjectChange}
          title={`${title} subject`}
          placeholder="e.g. 'win free money'"
        />
      </Title>
      <Row>
        <Col percent={50}>
          <EditorTitle>text/html</EditorTitle>
          <Editor
            value={template.htmlTemplate}
            onChange={onHtmlTemplateChange}
          />
        </Col>
        <Col percent={50}>
          <EditorTitle>text/plain</EditorTitle>
          <Editor
            value={template.textTemplate}
            onChange={onTextTemplateChange}
          />
        </Col>
      </Row>
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
