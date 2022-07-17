import * as React from "react";
import { useCallback } from "react";
import { QuestionDTO, TextQuestionConfigurationDTO } from "../../api/types/dto";
import { Checkboxes } from "../base/checkbox";
import { Spacer } from "../base/flex";
import { FlexRowColumnContainer, FlexRowContainer } from "../base/flex";
import { TextInput } from "../base/text-input";

const multilineOptionValue = "Multiline";
const convertToUrlOptionValue = "Convert answer to URL";

interface ITextQuestionEditorProps {
  question: QuestionDTO<TextQuestionConfigurationDTO>;
  onQuestionChange: (updatedQuestion: QuestionDTO) => any;
}

/**
 * An editor for text questions.
 * @see TextQuestion
 */
export const TextQuestionEditor = ({
  question,
  onQuestionChange,
}: ITextQuestionEditorProps) => {
  const handleConfigurationFieldChange = useCallback(
    (changes: Partial<TextQuestionConfigurationDTO>) => {
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
    (selected: string[]) => {
      handleConfigurationFieldChange({
        convertAnswerToUrl: selected.includes(convertToUrlOptionValue),
        multiline: selected.includes(multilineOptionValue),
      });
    },
    [handleConfigurationFieldChange, question],
  );

  const handlePlaceholderChange = useCallback(
    (placeholder: string) => handleConfigurationFieldChange({ placeholder }),
    [handleConfigurationFieldChange],
  );

  const appearanceOptions = [multilineOptionValue, convertToUrlOptionValue];

  const selectedAppearanceOptions = [
    ...(question.configuration.multiline ? [multilineOptionValue] : []),
    ...(question.configuration.convertAnswerToUrl
      ? [convertToUrlOptionValue]
      : []),
  ];

  return (
    <FlexRowContainer>
      <FlexRowColumnContainer>
        <TextInput
          value={question.configuration.placeholder}
          onChange={handlePlaceholderChange}
          placeholder="no placeholder"
          title="Input placeholder"
        />
      </FlexRowColumnContainer>
      <Spacer />
      <FlexRowColumnContainer>
        <Checkboxes
          onChange={handleAppearanceChange}
          selected={selectedAppearanceOptions}
          values={appearanceOptions}
          title="Appearance"
        />
      </FlexRowColumnContainer>
    </FlexRowContainer>
  );
};
