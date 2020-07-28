import * as React from "react";
import type {
  NumberQuestionConfigurationDTO,
  QuestionDTO,
} from "../../api/types/dto";
import { TextInput, TextInputType } from "../text-input";

interface INumberQuestionProps {
  question: QuestionDTO<NumberQuestionConfigurationDTO>;
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
}: INumberQuestionProps) => (
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
