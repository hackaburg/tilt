import * as React from "react";
import { useCallback } from "react";
import { QuestionDTO } from "../../api/types/dto";
import { QuestionType } from "../../api/types/enums";
import { UnifiedQuestion } from "./unified-question";

const deriveValue = (value: string, type: QuestionType): any => {
  switch (type) {
    case QuestionType.Choices:
      return value.split(",");

    default:
      return value;
  }
};

const deriveResult = (value: any, type: QuestionType): string => {
  switch (type) {
    case QuestionType.Choices:
      return (value as string[]).join(",");

    default:
      return String(value);
  }
};

interface IStringifiedUnifiedQuestionProps {
  question: QuestionDTO;
  value: string;
  onChange: (value: string) => any;
}

/**
 * The API expects stringified values. Modifying the values in the API client is
 * not viable, since we only have enough information, whether we need to convert
 * values here through the question's configuration.
 */
export const StringifiedUnifiedQuestion = ({
  question,
  value,
  onChange,
}: IStringifiedUnifiedQuestionProps) => {
  const handleChange = useCallback(
    (v) => onChange(deriveResult(v, question.configuration.type)),
    [onChange, question],
  );

  return (
    <UnifiedQuestion
      question={question}
      value={deriveValue(value, question.configuration.type)}
      onChange={handleChange}
    />
  );
};
