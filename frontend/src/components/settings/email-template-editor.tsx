import styled from "@emotion/styled";
import * as React from "react";
import { useCallback } from "react";
import type { EmailTemplateDTO } from "../../api/types/dto";
import { Elevated } from "../base/elevated";
import { Spacer } from "../base/flex";
import { FlexRowColumnContainer, FlexRowContainer } from "../base/flex";
import { Subsubheading } from "../base/headings";
import { TextInput, TextInputType } from "../base/text-input";

const EmailTemplateLength = 65_536;

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
    (value: string) => handleEmailTemplateChange({ subject: value }),
    [handleEmailTemplateChange],
  );

  const handleHtmlTemplateChange = useCallback(
    (value: string) => handleEmailTemplateChange({ htmlTemplate: value }),
    [handleEmailTemplateChange],
  );

  const handleTextTemplateChange = useCallback(
    (value: string) => handleEmailTemplateChange({ textTemplate: value }),
    [handleEmailTemplateChange],
  );

  return (
    <EmailTemplateEditorContainer level={1}>
      <Subsubheading text={title} />

      <TextInput
        value={template.subject}
        onChange={handleSubjectChange}
        title="Subject"
        placeholder="e.g. 'win free money'"
      />

      <FlexRowContainer>
        <FlexRowColumnContainer>
          <TextInput
            title="text/html"
            type={TextInputType.Area}
            maxLength={EmailTemplateLength}
            value={template.htmlTemplate}
            onChange={handleHtmlTemplateChange}
            placeholder="<html>"
          />
        </FlexRowColumnContainer>
        <Spacer />
        <FlexRowColumnContainer>
          <TextInput
            title="text/plain"
            type={TextInputType.Area}
            maxLength={EmailTemplateLength}
            value={template.textTemplate}
            onChange={handleTextTemplateChange}
            placeholder="Hi there!"
          />
        </FlexRowColumnContainer>
      </FlexRowContainer>
    </EmailTemplateEditorContainer>
  );
};
