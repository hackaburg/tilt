import * as React from "react";
import { enforceExhaustiveSwitch } from "../../../../backend/src/utils/switch";
import type {
  ChoicesQuestionConfigurationDTO,
  CountryQuestionConfigurationDTO,
  NumberQuestionConfigurationDTO,
  QuestionDTO,
  TextQuestionConfigurationDTO,
} from "../../api/types/dto";
import { QuestionType } from "../../api/types/enums";
import { FlexColumnContainer } from "../base/flex";
import { ChoicesQuestion } from "./choices-question";
import { CountryQuestion } from "./country-question";
import { NumberQuestion } from "./number-question";
import { TextQuestion } from "./text-question";

interface IQuestionProps {
  question: QuestionDTO;
  value: any;
  onChange: (value: any) => any;
  isDisabled?: boolean;
}

const Question = ({
  question,
  value,
  onChange,
  isDisabled,
}: IQuestionProps) => {
  const type = question.configuration.type;

  switch (type) {
    case QuestionType.Text:
      return (
        <TextQuestion
          question={question as QuestionDTO<TextQuestionConfigurationDTO>}
          onChange={onChange}
          value={value}
          isDisabled={isDisabled}
        />
      );

    case QuestionType.Number:
      return (
        <NumberQuestion
          question={question as QuestionDTO<NumberQuestionConfigurationDTO>}
          onChange={onChange}
          value={value}
          isDisabled={isDisabled}
        />
      );

    case QuestionType.Choices:
      return (
        <ChoicesQuestion
          question={question as QuestionDTO<ChoicesQuestionConfigurationDTO>}
          onSelectedChanged={onChange}
          selected={value}
          isDisabled={isDisabled}
        />
      );

    case QuestionType.Country:
      return (
        <CountryQuestion
          question={question as QuestionDTO<CountryQuestionConfigurationDTO>}
          onChange={onChange}
          valueInput={value}
          isDisabled={isDisabled}
        />
      );

    default:
      enforceExhaustiveSwitch(type);
      throw new Error(`unknown question type ${type}`);
  }
};

/**
 * A question component, displaying the respective question depending on the question's type.
 */
export const UnifiedQuestion = ({
  question,
  value,
  onChange,
  isDisabled,
}: IQuestionProps) => (
  <FlexColumnContainer>
    <Question
      question={question}
      value={value}
      onChange={onChange}
      isDisabled={isDisabled}
    />
  </FlexColumnContainer>
);
