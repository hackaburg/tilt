import * as React from "react";
import { INumberQuestion } from "../../../types/questions";
import { Col, Row } from "./grid";
import { TextInput, TextInputType } from "./text-input";

interface INumberQuestionProps {
  editable?: boolean;
  question: INumberQuestion;
  onQuestionChange?: (changed: Partial<INumberQuestion>) => any;

  value: number;
  onChange: (value: number) => any;
}

/**
 * A question to ask users for a number, e.g. their age.
 */
export const NumberQuestion = ({
  question,
  value,
  onChange,
  editable,
  onQuestionChange,
}: INumberQuestionProps) => {
  if (editable && onQuestionChange) {
    return (
      <>
        <TextInput
          value={question.placeholder}
          onChange={(placeholder) => onQuestionChange({ placeholder })}
          placeholder="no placeholder"
          title="Input placeholder"
        />

        <Row>
          <Col percent={50}>
            <TextInput
              type={TextInputType.Number}
              value={question.minValue}
              onChange={(minValue) => onQuestionChange({ minValue })}
              title="Minimum"
              placeholder="No minimum"
            />
          </Col>
          <Col percent={50}>
            <TextInput
              type={TextInputType.Number}
              value={question.maxValue}
              onChange={(maxValue) => onQuestionChange({ maxValue })}
              title="Maximum"
              placeholder="No maximum"
            />
          </Col>
        </Row>
      </>
    );
  }

  return (
    <TextInput
      mandatory={question.mandatory}
      min={question.minValue}
      max={question.maxValue}
      onChange={onChange}
      placeholder={question.placeholder}
      title={question.title}
      type={TextInputType.Number}
      value={value}
    />
  );
};
