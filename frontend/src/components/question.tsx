import styled from "@emotion/styled";
import * as React from "react";
import { useCallback } from "react";
import * as ReactMarkdown from "react-markdown";
import type {
  ChoicesQuestionConfigurationDTO,
  CountryQuestionConfigurationDTO,
  NumberQuestionConfigurationDTO,
  QuestionDTO,
  TextQuestionConfigurationDTO,
} from "../api/types/dto";
import { QuestionType } from "../api/types/enums";
import { Checkboxes } from "./checkbox";
import { ChoicesQuestion } from "./questions/choices-question";
import { CountryQuestion } from "./questions/country-question";
import { Col, Row } from "./grid";
import { NumberQuestion } from "./questions/number-question";
import { Select } from "./select";
import { TextInput, TextInputType } from "./text-input";
import { TextQuestion } from "./questions/text-question";

const Meta = styled.div`
  margin-bottom: 3rem;
`;

const getDefaultQuestionConfiguration = (type: string) => {
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

const mandatoryOptionName = "Mandatory";
const mandatoryAllCheckboxOptions = [mandatoryOptionName];
const mandatorySelectedCheckboxOptions = mandatoryAllCheckboxOptions;
const mandatoryNotSelectedCheckboxOptions = [] as string[];

interface IQuestionProps {
  question: QuestionDTO;
  onQuestionChange?: (question: QuestionDTO) => any;
  editable?: boolean;
  value: any;
  onChange: (value: any) => any;
}

/**
 * A question component, displaying the respective question depending on the @see IQuestionBase.type value.
 * If it's not a known question, only the settings will be rendered.
 */
export const Question = ({
  question,
  onQuestionChange,
  editable,
  value,
  onChange,
}: IQuestionProps) => {
  const renderedQuestion = (
    <>
      {question.configuration.type === QuestionType.Text && (
        <TextQuestion
          editable={editable}
          question={question as QuestionDTO<TextQuestionConfigurationDTO>}
          onQuestionChange={onQuestionChange}
          onChange={onChange}
          value={value}
        />
      )}

      {question.configuration.type === QuestionType.Number && (
        <NumberQuestion
          editable={editable}
          question={question as QuestionDTO<NumberQuestionConfigurationDTO>}
          onQuestionChange={onQuestionChange}
          onChange={onChange}
          value={value}
        />
      )}

      {question.configuration.type === QuestionType.Choices && (
        <ChoicesQuestion
          editable={editable}
          question={question as QuestionDTO<ChoicesQuestionConfigurationDTO>}
          onQuestionChange={onQuestionChange}
          onSelectedChanged={onChange}
          selected={value}
        />
      )}

      {question.configuration.type === QuestionType.Country && (
        <CountryQuestion
          editable={editable}
          question={question as QuestionDTO<CountryQuestionConfigurationDTO>}
          onChange={onChange}
          value={value}
        />
      )}
    </>
  );

  const handleQuestionFieldChange = useCallback(
    (field: keyof QuestionDTO, fieldValue: any) => {
      if (!onQuestionChange) {
        return;
      }

      onQuestionChange({
        ...question,
        [field]: fieldValue,
      });
    },
    [onQuestionChange, question],
  );

  const handleQuestionTypeChange = useCallback(
    (type: string) => {
      const configuration = getDefaultQuestionConfiguration(type);
      handleQuestionFieldChange("configuration", configuration);
    },
    [handleQuestionFieldChange],
  );

  const handleQuestionTitleChange = useCallback(
    (v) => handleQuestionFieldChange("title", v),
    [handleQuestionFieldChange],
  );

  const handleQuestionDescriptionChange = useCallback(
    (v) => handleQuestionFieldChange("description", v),
    [handleQuestionFieldChange],
  );

  const handleQuestionMandatoryChange = useCallback(
    (selected: string[]) =>
      handleQuestionFieldChange(
        "mandatory",
        selected.includes(mandatoryOptionName),
      ),
    [handleQuestionFieldChange, mandatoryOptionName],
  );

  const handleQuestionParentIDChange = useCallback(
    (v) => handleQuestionFieldChange("parentID", v),
    [handleQuestionFieldChange],
  );

  const handleQuestionParentValueChange = useCallback(
    (v) => handleQuestionFieldChange("showIfParentHasValue", v),
    [handleQuestionFieldChange],
  );

  if (editable) {
    return (
      <>
        <Meta>
          <Row>
            <Col percent={50}>
              <Select
                onChange={handleQuestionTypeChange}
                value={question.configuration.type}
                values={[
                  QuestionType.Text,
                  QuestionType.Number,
                  QuestionType.Country,
                  QuestionType.Choices,
                ]}
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
                value={question.parentID}
                onChange={handleQuestionParentIDChange}
                title="Parent question reference name"
                placeholder="no parent question"
              />
            </Col>

            <Col percent={50}>
              <TextInput
                value={question.showIfParentHasValue!}
                onChange={handleQuestionParentValueChange}
                title="Only show this question if the parent question has this value"
                placeholder="no value"
              />
            </Col>
          </Row>
        </Meta>

        {renderedQuestion}
      </>
    );
  }

  return (
    <>
      <ReactMarkdown source={question.description} linkTarget="_blank" />

      {renderedQuestion}
    </>
  );
};
