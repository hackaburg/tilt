import * as React from "react";
import { useCallback } from "react";
import {
  NumberQuestionConfigurationDTO,
  QuestionDTO,
} from "../../api/types/dto";
import { Spacer } from "../base/flex";
import { FlexRowColumnContainer, FlexRowContainer } from "../base/flex";
import { TextInput, TextInputType } from "../base/text-input";

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
    (changes: Partial<NumberQuestionConfigurationDTO>) => {
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

  const handlePlaceholderChange = useCallback(
    (value: string) => handleConfigurationFieldChange({ placeholder: value }),
    [handleConfigurationFieldChange],
  );

  const handleMinValueChange = useCallback(
    (value: number) =>
      handleConfigurationFieldChange({
        minValue: isNaN(value) ? undefined : value,
      }),
    [handleConfigurationFieldChange],
  );

  const handleMaxValueChange = useCallback(
    (value: number) =>
      handleConfigurationFieldChange({
        maxValue: isNaN(value) ? undefined : value,
      }),
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

      <FlexRowContainer>
        <FlexRowColumnContainer>
          <TextInput
            type={TextInputType.Number}
            value={question.configuration.minValue}
            onChange={handleMinValueChange}
            title="Minimum"
            placeholder="No minimum"
          />
        </FlexRowColumnContainer>
        <Spacer />
        <FlexRowColumnContainer>
          <TextInput
            type={TextInputType.Number}
            value={question.configuration.maxValue}
            onChange={handleMaxValueChange}
            title="Maximum"
            placeholder="No maximum"
          />
        </FlexRowColumnContainer>
      </FlexRowContainer>
    </>
  );
};
