import * as React from "react";
import { useCallback } from "react";
import {
  NumberQuestionConfigurationDTO,
  QuestionDTO,
} from "../../api/types/dto";
import { Col, Row } from "../grid";
import { TextInput, TextInputType } from "../text-input";

interface INumberQuestionEditorProps {
  question: QuestionDTO<NumberQuestionConfigurationDTO>;
  onQuestionChange: (question: QuestionDTO) => any;
}

/**
 * An editor for number questions.
 * @see NumberQuestion
 */
export const NumberQuestionEditor = ({
  question,
  onQuestionChange,
}: INumberQuestionEditorProps) => {
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
};
