import * as React from "react";
import { useCallback, useMemo } from "react";
import {
  ChoicesQuestionConfigurationDTO,
  QuestionDTO,
} from "../../api/types/dto";
import { Checkboxes } from "../checkbox";
import { Col, Row } from "../grid";
import { TextInput, TextInputType } from "../text-input";

const checkboxOptionValue = "Use checkboxes";
const radioOptionValue = "Use radio buttons";
const displayAsDropdownOptionValue = "Use a dropdown";
const appearanceOptions = [
  checkboxOptionValue,
  radioOptionValue,
  displayAsDropdownOptionValue,
];

interface IChoicesQuestionEditorProps {
  question: QuestionDTO<ChoicesQuestionConfigurationDTO>;
  onQuestionChange: (question: QuestionDTO) => any;
}

/**
 * An editor for choices questions.
 * @see ChoicesQuestion
 */
export const ChoicesQuestionEditor = ({
  question,
  onQuestionChange,
}: IChoicesQuestionEditorProps) => {
  const selectedAppearanceOptions = useMemo(() => {
    if (question.configuration.allowMultiple) {
      return [checkboxOptionValue];
    } else if (question.configuration.displayAsDropdown) {
      return [displayAsDropdownOptionValue];
    }

    return [radioOptionValue];
  }, [
    question.configuration.allowMultiple,
    question.configuration.displayAsDropdown,
  ]);

  const handleConfigurationChange = useCallback(
    (field: keyof ChoicesQuestionConfigurationDTO, fieldValue: any) => {
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
    (selectedAppearance: string[]) => {
      handleConfigurationChange(
        "allowMultiple",
        selectedAppearance.includes(checkboxOptionValue),
      );

      handleConfigurationChange(
        "displayAsDropdown",
        selectedAppearance.includes(displayAsDropdownOptionValue),
      );
    },
    [handleConfigurationChange],
  );

  const handleChoicesUpdate = useCallback(
    (text: string) => {
      handleConfigurationChange(
        "choices",
        text
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line.length > 0),
      );
    },
    [handleConfigurationChange],
  );

  const choicesText = question.configuration.choices.join("\n");

  return (
    <>
      <Row>
        <Col percent={50}>
          <TextInput
            type={TextInputType.Area}
            title="Options"
            placeholder="no options"
            value={choicesText}
            onChange={handleChoicesUpdate}
          />
        </Col>
        <Col percent={50}>
          <Checkboxes
            values={appearanceOptions}
            selected={selectedAppearanceOptions}
            onChange={handleAppearanceChange}
            title="Appearance"
            radio
          />
        </Col>
      </Row>
    </>
  );
};
