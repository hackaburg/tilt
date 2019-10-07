import * as React from "react";
import { ITextQuestion } from "../../../types/questions";
import { Checkboxes } from "./checkbox";
import { Col, Row } from "./grid";
import { TextInput, TextInputType } from "./text-input";

interface ITextQuestionProps {
  editable?: boolean;
  question: ITextQuestion;
  onQuestionChange?: (updatedQuestion: Partial<ITextQuestion>) => any;

  value: string;
  onChange: (value: string) => any;
}

/**
 * An editable text question.
 */
export const TextQuestion = ({
  question,
  onQuestionChange,
  editable,
  value,
  onChange,
}: ITextQuestionProps) => {
  if (editable && onQuestionChange) {
    const multilineOptionValue = "Multiline";
    const convertToUrlOptionValue = "Convert answer to URL";

    const appearanceOptions = [multilineOptionValue, convertToUrlOptionValue];

    const selectedAppearanceOptions = [
      ...(question.multiline ? [multilineOptionValue] : []),
      ...(question.convertAnswerToUrl ? [convertToUrlOptionValue] : []),
    ];

    const handleAppearanceChange = (selected: string[]) => {
      onQuestionChange({
        convertAnswerToUrl: selected.includes(convertToUrlOptionValue),
        multiline: selected.includes(multilineOptionValue),
      });
    };

    return (
      <>
        <Row>
          <Col percent={50}>
            <TextInput
              value={question.placeholder}
              onChange={(placeholder) => onQuestionChange({ placeholder })}
              placeholder="no placeholder"
              title="Input placeholder"
            />
          </Col>

          <Col percent={50}>
            <Checkboxes
              onChange={handleAppearanceChange}
              selected={selectedAppearanceOptions}
              values={appearanceOptions}
              title="Appearance"
            />
          </Col>
        </Row>
      </>
    );
  }

  return (
    <TextInput
      onChange={onChange}
      value={value}
      placeholder={question.placeholder!}
      title={question.title}
      mandatory={question.mandatory}
      type={question.multiline ? TextInputType.Area : TextInputType.Text}
    />
  );
};
