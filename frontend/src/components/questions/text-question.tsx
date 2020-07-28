import * as React from "react";
import { useCallback } from "react";
import type {
  QuestionDTO,
  TextQuestionConfigurationDTO,
} from "../../api/types/dto";
import { Checkboxes } from "../checkbox";
import { Col, Row } from "../grid";
import { TextInput, TextInputType } from "../text-input";

const multilineOptionValue = "Multiline";
const convertToUrlOptionValue = "Convert answer to URL";

interface ITextQuestionProps {
  editable?: boolean;
  question: QuestionDTO<TextQuestionConfigurationDTO>;
  onQuestionChange?: (updatedQuestion: QuestionDTO) => any;

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
  const handleConfigurationFieldChange = useCallback(
    (field: keyof TextQuestionConfigurationDTO, fieldValue: any) => {
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

  const handleAppearanceChange = useCallback(
    (selected: string[]) => {
      handleConfigurationFieldChange(
        "convertAnswerToUrl",
        selected.includes(convertToUrlOptionValue),
      );

      handleConfigurationFieldChange(
        "multiline",
        selected.includes(multilineOptionValue),
      );
    },
    [handleConfigurationFieldChange, question],
  );

  const handlePlaceholderChange = useCallback(
    (placeholder) => handleConfigurationFieldChange("placeholder", placeholder),
    [handleConfigurationFieldChange],
  );

  if (editable) {
    const appearanceOptions = [multilineOptionValue, convertToUrlOptionValue];

    const selectedAppearanceOptions = [
      ...(question.configuration.multiline ? [multilineOptionValue] : []),
      ...(question.configuration.convertAnswerToUrl
        ? [convertToUrlOptionValue]
        : []),
    ];

    return (
      <>
        <Row>
          <Col percent={50}>
            <TextInput
              value={question.configuration.placeholder}
              onChange={handlePlaceholderChange}
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
      placeholder={question.configuration.placeholder}
      title={question.title}
      mandatory={question.mandatory}
      type={
        question.configuration.multiline
          ? TextInputType.Area
          : TextInputType.Text
      }
    />
  );
};
