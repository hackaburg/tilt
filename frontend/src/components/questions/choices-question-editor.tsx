import * as React from "react";
import { useCallback, useMemo } from "react";
import {
  ChoicesQuestionConfigurationDTO,
  QuestionDTO,
} from "../../api/types/dto";
import { Checkboxes } from "../base/checkbox";
import { Spacer } from "../base/flex";
import { FlexRowColumnContainer, FlexRowContainer } from "../base/flex";
import { TextInput, TextInputType } from "../base/text-input";

const separator = "\n";
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
    (changes: Partial<ChoicesQuestionConfigurationDTO>) => {
      if (!onQuestionChange) {
        return;
      }

      onQuestionChange({
        ...question,
        configuration: {
          ...question.configuration,
          ...changes,
        },
      });
    },
    [onQuestionChange, question],
  );

  const handleAppearanceChange = useCallback(
    (selectedAppearance: string[]) => {
      handleConfigurationChange({
        allowMultiple: selectedAppearance.includes(checkboxOptionValue),
        displayAsDropdown: selectedAppearance.includes(
          displayAsDropdownOptionValue,
        ),
      });
    },
    [handleConfigurationChange],
  );

  const handleChoicesUpdate = useCallback(
    (text: string) => {
      const choices = text
        .split(separator)
        .filter((option) => option.trim().length > 0);

      const choicesWithTrailingComma = text.endsWith(separator)
        ? [...choices, ""]
        : choices;

      handleConfigurationChange({
        choices: choicesWithTrailingComma,
      });
    },
    [handleConfigurationChange],
  );

  const choicesText = question.configuration.choices.join(separator);

  return (
    <FlexRowContainer>
      <FlexRowColumnContainer>
        <TextInput
          type={TextInputType.Area}
          title="Options (one per line)"
          placeholder="no options"
          value={choicesText}
          onChange={handleChoicesUpdate}
        />
      </FlexRowColumnContainer>
      <Spacer />
      <FlexRowColumnContainer>
        <Checkboxes
          values={appearanceOptions}
          selected={selectedAppearanceOptions}
          onChange={handleAppearanceChange}
          title="Appearance"
          radio
        />
      </FlexRowColumnContainer>
    </FlexRowContainer>
  );
};
