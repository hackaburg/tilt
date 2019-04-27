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
export const TextQuestion = ({ question, onQuestionChange, editable, value, onChange }: ITextQuestionProps) => {
  if (editable && onQuestionChange) {
    const multilineOptionValue = "Multiline";

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
              onChange={(selected) => onQuestionChange({ multiline: selected.includes(multilineOptionValue) })}
              selected={question.multiline ? [multilineOptionValue] : []}
              values={[multilineOptionValue]}
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
