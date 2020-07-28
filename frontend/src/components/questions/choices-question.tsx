import * as React from "react";
import type {
  ChoicesQuestionConfigurationDTO,
  QuestionDTO,
} from "../../api/types/dto";
import { Checkboxes } from "../checkbox";
import { Select } from "../select";

interface IChoicesQuestionProps {
  question: QuestionDTO<ChoicesQuestionConfigurationDTO>;
  selected: string[];
  onSelectedChanged: (selected: string[]) => any;
}

/**
 * A question to select from multiple options, either via dropdown, checkboxes or radio boxes.
 */
export const ChoicesQuestion = ({
  question,
  selected,
  onSelectedChanged,
}: IChoicesQuestionProps) => {
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
