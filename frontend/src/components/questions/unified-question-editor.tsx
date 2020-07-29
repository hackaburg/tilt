import styled from "@emotion/styled";
import * as React from "react";
import { useCallback } from "react";
import { IQuestionConfiguration } from "../../../../backend/src/entities/question";
import { enforceExhaustiveSwitch } from "../../../../backend/src/utils/switch";
import {
  ChoicesQuestionConfigurationDTO,
  NumberQuestionConfigurationDTO,
  QuestionDTO,
  TextQuestionConfigurationDTO,
} from "../../api/types/dto";
import { QuestionType } from "../../api/types/enums";
import { Checkboxes } from "../checkbox";
import { Col, Row } from "../grid";
import { Select } from "../select";
import { TextInput, TextInputType } from "../text-input";
import { ChoicesQuestionEditor } from "./choices-question-editor";
import { CountryQuestionEditor } from "./country-question-editor";
import { NumberQuestionEditor } from "./number-question-editor";
import { TextQuestionEditor } from "./text-question-editor";

const Meta = styled.div`
  margin-bottom: 3rem;
`;

interface IUnifiedQuestionEditorProps {
  question: QuestionDTO;
  onQuestionChange: (question: QuestionDTO) => any;
}

const QuestionEditor = ({
  question,
  onQuestionChange,
}: IUnifiedQuestionEditorProps) => {
  const type = question.configuration.type;

  switch (type) {
    case QuestionType.Text:
      return (
        <TextQuestionEditor
          question={question as QuestionDTO<TextQuestionConfigurationDTO>}
          onQuestionChange={onQuestionChange}
        />
      );

    case QuestionType.Number:
      return (
        <NumberQuestionEditor
          question={question as QuestionDTO<NumberQuestionConfigurationDTO>}
          onQuestionChange={onQuestionChange}
        />
      );

    case QuestionType.Choices:
      return (
        <ChoicesQuestionEditor
          question={question as QuestionDTO<ChoicesQuestionConfigurationDTO>}
          onQuestionChange={onQuestionChange}
        />
      );

    case QuestionType.Country:
      return <CountryQuestionEditor />;

    default:
      enforceExhaustiveSwitch(type);
      throw new Error(`unknown question editor type ${type}`);
  }
};

const getDefaultQuestionConfiguration = (
  type: string,
): IQuestionConfiguration => {
  switch (type) {
    case QuestionType.Text:
      return {
        convertAnswerToUrl: false,
        multiline: false,
        placeholder: "",
        type: QuestionType.Text,
      };

    case QuestionType.Number:
      return {
        allowDecimals: false,
        maxValue: 10,
        minValue: 0,
        placeholder: "",
        type: QuestionType.Number,
      };

    case QuestionType.Country:
      return {
        type: QuestionType.Country,
      };

    case QuestionType.Choices:
      return {
        allowMultiple: true,
        choices: [],
        displayAsDropdown: false,
        type: QuestionType.Choices,
      };

    default:
      throw new Error(`unknown question type '${type}'`);
  }
};

const availableQuestionTypes = [
  QuestionType.Text,
  QuestionType.Number,
  QuestionType.Country,
  QuestionType.Choices,
];

const mandatoryOptionName = "Mandatory";
const mandatoryAllCheckboxOptions = [mandatoryOptionName];
const mandatorySelectedCheckboxOptions = mandatoryAllCheckboxOptions;
const mandatoryNotSelectedCheckboxOptions = [] as string[];

/**
 * A unified editor for all questions.
 */
export const UnifiedQuestionEditor = ({
  question,
  onQuestionChange,
}: IUnifiedQuestionEditorProps) => {
  const handleQuestionFieldChange = useCallback(
    (changes: Partial<QuestionDTO>) => {
      if (!onQuestionChange) {
        return;
      }

      onQuestionChange({
        ...question,
        ...changes,
      });
    },
    [onQuestionChange, question],
  );

  const handleQuestionTypeChange = useCallback(
    (type: string) => {
      const configuration = getDefaultQuestionConfiguration(type);
      handleQuestionFieldChange({ configuration });
    },
    [handleQuestionFieldChange],
  );

  const handleQuestionTitleChange = useCallback(
    (title) => handleQuestionFieldChange({ title }),
    [handleQuestionFieldChange],
  );

  const handleQuestionDescriptionChange = useCallback(
    (description) => handleQuestionFieldChange({ description }),
    [handleQuestionFieldChange],
  );

  const handleQuestionMandatoryChange = useCallback(
    (selected: string[]) =>
      handleQuestionFieldChange({
        mandatory: selected.includes(mandatoryOptionName),
      }),
    [handleQuestionFieldChange, mandatoryOptionName],
  );

  const handleQuestionParentIDChange = useCallback(
    (value) => {
      const trimmed = value.trim();
      handleQuestionFieldChange({
        parentID: trimmed === "" ? undefined : trimmed,
      });
    },
    [handleQuestionFieldChange],
  );

  const handleQuestionParentValueChange = useCallback(
    (value) => {
      const trimmed = value.trim();
      handleQuestionFieldChange({
        showIfParentHasValue: trimmed === "" ? undefined : trimmed,
      });
    },
    [handleQuestionFieldChange],
  );

  return (
    <>
      <Meta>
        <Row>
          <Col percent={50}>
            <Select
              onChange={handleQuestionTypeChange}
              value={question.configuration.type}
              values={availableQuestionTypes}
              title="Question type"
            />
          </Col>

          <Col percent={50}>
            <TextInput
              value={question.title}
              onChange={handleQuestionTitleChange}
              placeholder="Title"
              title="Title"
            />
          </Col>
        </Row>

        <Row>
          <Col percent={50}>
            <TextInput
              value={question.description}
              onChange={handleQuestionDescriptionChange}
              placeholder="Description"
              title="Description"
              type={TextInputType.Area}
            />
          </Col>
          <Col percent={50}>
            <Checkboxes
              values={mandatoryAllCheckboxOptions}
              selected={
                question.mandatory
                  ? mandatorySelectedCheckboxOptions
                  : mandatoryNotSelectedCheckboxOptions
              }
              onChange={handleQuestionMandatoryChange}
              title="Behaviour"
            />
          </Col>
        </Row>

        <Row>
          <Col percent={50}>
            <TextInput
              type={TextInputType.Number}
              value={question.parentID ?? ""}
              onChange={handleQuestionParentIDChange}
              title="Parent question reference name"
              placeholder="no parent question"
            />
          </Col>

          <Col percent={50}>
            <TextInput
              value={question.showIfParentHasValue ?? ""}
              onChange={handleQuestionParentValueChange}
              title="Only show this question if the parent question has this value"
              placeholder="no value"
            />
          </Col>
        </Row>
      </Meta>

      <QuestionEditor question={question} onQuestionChange={onQuestionChange} />
    </>
  );
};
