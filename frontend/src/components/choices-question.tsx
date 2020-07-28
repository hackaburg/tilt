import * as React from "react";
import { useCallback, useMemo } from "react";
import type {
  ChoicesQuestionConfigurationDTO,
  QuestionDTO,
} from "../api/types/dto";
import { Checkboxes } from "./checkbox";
import { Col, Row } from "./grid";
import { Select } from "./select";
import { TextInput, TextInputType } from "./text-input";

const checkboxOptionValue = "Use checkboxes";
const radioOptionValue = "Use radio buttons";
const displayAsDropdownOptionValue = "Use a dropdown";
const appearanceOptions = [
  checkboxOptionValue,
  radioOptionValue,
  displayAsDropdownOptionValue,
];

interface IChoicesQuestionProps {
  editable?: boolean;
  question: QuestionDTO<ChoicesQuestionConfigurationDTO>;
  onQuestionChange?: (changes: Partial<QuestionDTO>) => any;

  selected: string[];
  onSelectedChanged: (selected: string[]) => any;
}

/**
 * A question to select from multiple options, either via dropdown, checkboxes or radio boxes.
 */
export const ChoicesQuestion = ({
  editable,
  onQuestionChange,
  question,
  selected,
  onSelectedChanged,
}: IChoicesQuestionProps) => {
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

  if (editable) {
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
  }

  if (question.configuration.displayAsDropdown) {
    return (
      <Select
        mandatory={question.mandatory}
        onChange={(value) => onSelectedChanged([value])}
        title={question.title}
        value={selected[0]}
        values={question.configuration.choices}
      />
    );
  }

  return (
    <Checkboxes
      values={question.configuration.choices}
      selected={selected}
      onChange={onSelectedChanged}
      title={question.title}
      mandatory={question.mandatory}
      radio={!question.configuration.allowMultiple}
    />
  );
};
