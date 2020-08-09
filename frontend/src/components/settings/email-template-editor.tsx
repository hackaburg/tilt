import styled from "@emotion/styled";
import * as React from "react";
import { useCallback } from "react";
import type { EmailTemplateDTO } from "../../api/types/dto";
import { Elevated } from "../base/elevated";
import { HorizontalSpacer } from "../base/flex";
import { Col, Row } from "../base/grid";
import { Subsubheading } from "../base/headings";
import { TextInput, TextInputType } from "../base/text-input";

const EmailTemplateEditorContainer = styled(Elevated)`
  padding: 1rem;
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
  const handleEmailTemplateChange = useCallback(
    (changes: Partial<EmailTemplateDTO>) => {
      onTemplateChange({
        ...template,
        ...changes,
      });
    },
    [onTemplateChange, template],
  );

  const handleSubjectChange = useCallback(
    (value) => handleEmailTemplateChange({ subject: value }),
    [handleEmailTemplateChange],
  );

  const handleHtmlTemplateChange = useCallback(
    (value) => handleEmailTemplateChange({ htmlTemplate: value }),
    [handleEmailTemplateChange],
  );

  const handleTextTemplateChange = useCallback(
    (value) => handleEmailTemplateChange({ textTemplate: value }),
    [handleEmailTemplateChange],
  );

  return (
    <EmailTemplateEditorContainer level={1}>
      <Subsubheading>{title}</Subsubheading>

      <TextInput
        value={template.subject}
        onChange={handleSubjectChange}
        title="Subject"
        placeholder="e.g. 'win free money'"
      />

      <Row>
        <Col>
          <TextInput
            title="text/html"
            type={TextInputType.Area}
            value={template.htmlTemplate}
            onChange={handleHtmlTemplateChange}
            placeholder="<html>"
          />
        </Col>
        <HorizontalSpacer />
        <Col>
          <TextInput
            title="text/plain"
            type={TextInputType.Area}
            value={template.textTemplate}
            onChange={handleTextTemplateChange}
            placeholder="Hi there!"
          />
        </Col>
      </Row>
    </EmailTemplateEditorContainer>
  );
};
