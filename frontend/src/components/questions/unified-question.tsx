import * as React from "react";
import FlexView from "react-flexview";
import { enforceExhaustiveSwitch } from "../../../../backend/src/utils/switch";
import type {
  ChoicesQuestionConfigurationDTO,
  CountryQuestionConfigurationDTO,
  NumberQuestionConfigurationDTO,
  QuestionDTO,
  TextQuestionConfigurationDTO,
} from "../../api/types/dto";
import { QuestionType } from "../../api/types/enums";
import { Markdown } from "../markdown";
import { ChoicesQuestion } from "./choices-question";
import { CountryQuestion } from "./country-question";
import { NumberQuestion } from "./number-question";
import { TextQuestion } from "./text-question";

interface IQuestionProps {
  question: QuestionDTO;
  value: any;
  onChange: (value: any) => any;
}

const Question = ({ question, value, onChange }: IQuestionProps) => {
  const type = question.configuration.type;

  switch (type) {
    case QuestionType.Text:
      return (
        <TextQuestion
          question={question as QuestionDTO<TextQuestionConfigurationDTO>}
          onChange={onChange}
          value={value}
        />
      );

    case QuestionType.Number:
      return (
        <NumberQuestion
          question={question as QuestionDTO<NumberQuestionConfigurationDTO>}
          onChange={onChange}
          value={value}
        />
      );

    case QuestionType.Choices:
      return (
        <ChoicesQuestion
          question={question as QuestionDTO<ChoicesQuestionConfigurationDTO>}
          onSelectedChanged={onChange}
          selected={value}
        />
      );

    case QuestionType.Country:
      return (
        <CountryQuestion
          question={question as QuestionDTO<CountryQuestionConfigurationDTO>}
          onChange={onChange}
          value={value}
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
}: IQuestionProps) => (
  <FlexView column grow>
    <Markdown text={question.description} />
    <Question question={question} value={value} onChange={onChange} />
  </FlexView>
);
