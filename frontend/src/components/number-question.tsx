import * as React from "react";
import { useCallback } from "react";
import type {
  NumberQuestionConfigurationDTO,
  QuestionDTO,
} from "../api/types/dto";
import { Col, Row } from "./grid";
import { TextInput, TextInputType } from "./text-input";

interface INumberQuestionProps {
  editable?: boolean;
  question: QuestionDTO<NumberQuestionConfigurationDTO>;
  onQuestionChange?: (question: QuestionDTO) => any;

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
  const handleConfigurationFieldChange = useCallback(
    (field: keyof NumberQuestionConfigurationDTO, fieldValue: any) => {
      if (!onQuestionChange) {
        return;
      }

      onQuestionChange({
        ...question,
        configuration: {
          ...question.configuration,
          [field]: fieldValue,
        },
      });
    },
    [onQuestionChange, question],
  );

  const handlePlaceholderChange = useCallback(
    (v) => handleConfigurationFieldChange("placeholder", v),
    [handleConfigurationFieldChange],
  );

  const handleMinValueChange = useCallback(
    (v) => handleConfigurationFieldChange("minValue", isNaN(v) ? undefined : v),
    [handleConfigurationFieldChange],
  );

  const handleMaxValueChange = useCallback(
    (v) => handleConfigurationFieldChange("maxValue", isNaN(v) ? undefined : v),
    [handleConfigurationFieldChange],
  );

  if (editable) {
    return (
      <>
        <TextInput
          value={question.configuration.placeholder}
          onChange={handlePlaceholderChange}
          placeholder="no placeholder"
          title="Input placeholder"
        />

        <Row>
          <Col percent={50}>
            <TextInput
              type={TextInputType.Number}
              value={question.configuration.minValue}
              onChange={handleMinValueChange}
              title="Minimum"
              placeholder="No minimum"
            />
          </Col>
          <Col percent={50}>
            <TextInput
              type={TextInputType.Number}
              value={question.configuration.maxValue}
              onChange={handleMaxValueChange}
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
