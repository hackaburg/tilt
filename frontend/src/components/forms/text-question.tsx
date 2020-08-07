import * as React from "react";
import type {
  QuestionDTO,
  TextQuestionConfigurationDTO,
} from "../../api/types/dto";
import { TextInput, TextInputType } from "../base/text-input";

interface ITextQuestionProps {
  question: QuestionDTO<TextQuestionConfigurationDTO>;
  value: string;
  onChange: (value: string) => any;
  isDisabled?: boolean;
}

/**
 * An editable text question.
 */
export const TextQuestion = ({
  question,
  value,
  onChange,
  isDisabled,
}: ITextQuestionProps) => {
  return (
    <TextInput
      onChange={onChange}
      value={value}
      placeholder={question.configuration.placeholder}
      title={question.title}
      mandatory={question.mandatory}
      isDisabled={isDisabled}
      type={
        question.configuration.multiline
          ? TextInputType.Area
          : TextInputType.Text
      }
    />
  );
};
