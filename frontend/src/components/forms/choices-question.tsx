import * as React from "react";
import type {
  ChoicesQuestionConfigurationDTO,
  QuestionDTO,
} from "../../api/types/dto";
import { Checkboxes } from "../base/checkbox";
import { Select } from "../base/select";

interface IChoicesQuestionProps {
  question: QuestionDTO<ChoicesQuestionConfigurationDTO>;
  selected: string[];
  onSelectedChanged: (selected: string[]) => any;
  isDisabled?: boolean;
}

/**
 * A question to select from multiple options, either via dropdown, checkboxes or radio boxes.
 */
export const ChoicesQuestion = ({
  question,
  selected,
  onSelectedChanged,
  isDisabled,
}: IChoicesQuestionProps) => {
  if (question.configuration.displayAsDropdown) {
    return (
      <Select
        mandatory={question.mandatory}
        onChange={(value) => onSelectedChanged([value])}
        title={question.title}
        value={selected[0]}
        values={question.configuration.choices}
        isDisabled={isDisabled}
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
      isDisabled={isDisabled}
    />
  );
};
