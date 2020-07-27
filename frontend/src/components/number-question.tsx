import * as React from "react";
import type {
  NumberQuestionConfigurationDTO,
  QuestionDTO,
} from "../api/types/dto";
import { Col, Row } from "./grid";
import { TextInput, TextInputType } from "./text-input";

interface INumberQuestionProps {
  editable?: boolean;
  question: QuestionDTO<NumberQuestionConfigurationDTO>;
  onQuestionChange?: (changed: Partial<QuestionDTO>) => any;

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
          value={question.configuration.placeholder}
          onChange={(placeholder) =>
            onQuestionChange({
              configuration: { ...question.configuration, placeholder },
            })
          }
          placeholder="no placeholder"
          title="Input placeholder"
        />

        <Row>
          <Col percent={50}>
            <TextInput
              type={TextInputType.Number}
              value={question.configuration.minValue}
              onChange={(minValue) =>
                onQuestionChange({
                  configuration: { ...question.configuration, minValue },
                })
              }
              title="Minimum"
              placeholder="No minimum"
            />
          </Col>
          <Col percent={50}>
            <TextInput
              type={TextInputType.Number}
              value={question.configuration.maxValue}
              onChange={(maxValue) =>
                onQuestionChange({
                  configuration: { ...question.configuration, maxValue },
                })
              }
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
      min={question.configuration.minValue}
      max={question.configuration.maxValue}
      onChange={onChange}
      placeholder={question.configuration.placeholder}
      title={question.title}
      type={TextInputType.Number}
      value={value}
    />
  );
};
