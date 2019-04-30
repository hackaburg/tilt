import { v4 as uuid } from "node-uuid";
import * as React from "react";
import * as ReactMarkdown from "react-markdown";
import styled from "styled-components";
import { IQuestion, IQuestionBase, QuestionType } from "../../../types/questions";
import { Checkboxes } from "./checkbox";
import { ChoicesQuestion } from "./choices-question";
import { CountryQuestion } from "./country-question";
import { Col, Row } from "./grid";
import { NumberQuestion } from "./number-question";
import { Select } from "./select";
import { TextInput, TextInputType } from "./text-input";
import { TextQuestion } from "./text-question";

const Meta = styled.div`
  margin-bottom: 3rem;
`;

interface IQuestionProps {
  question: IQuestion;
  onQuestionChange?: (changes: Partial<IQuestion>) => any;
  editable?: boolean;
  value: any;
  onChange: (value: any) => any;
}

/**
 * A question component, displaying the respective question depending on the @see IQuestionBase.type value.
 * If it's not a known question, only the settings will be rendered.
 */
export const Question = ({ question, onQuestionChange, editable, value, onChange }: IQuestionProps) => {
  const handleQuestionChange = (changes: Partial<IQuestion>) => {
    if (onQuestionChange) {
      onQuestionChange(changes);
    }
  };

  const renderedQuestion = (
    <>
      {question.type === QuestionType.Text && (
        <TextQuestion
          editable={editable}
          question={question}
          onQuestionChange={handleQuestionChange}

          onChange={onChange}
          value={value}
        />
      )}

      {question.type === QuestionType.Number && (
        <NumberQuestion
          editable={editable}
          question={question}
          onQuestionChange={handleQuestionChange}

          onChange={onChange}
          value={value}
        />
      )}

      {question.type === QuestionType.Choices && (
        <ChoicesQuestion
          editable={editable}
          question={question}
          onQuestionChange={handleQuestionChange}

          onSelectedChanged={onChange}
          selected={value}
        />
      )}

      {question.type === QuestionType.Country && (
        <CountryQuestion
          editable={editable}
          question={question}
          onChange={onChange}
          value={value}
        />
      )}
    </>
  );

  if (editable) {
    const mandatoryOptionName = "Mandatory";
    const handleQuestionTypeChange = (type: string) => {
      const base: IQuestionBase = {
        description: "",
        mandatory: false,
        parentReferenceName: "",
        referenceName: uuid(),
        showIfParentHasValue: "",
        title: "",
      };

      switch (type) {
        case QuestionType.Text:
          handleQuestionChange({
            ...base,
            convertAnswerToUrl: false,
            multiline: false,
            placeholder: "",
            title: "Text question",
            type: QuestionType.Text,
          });
          break;

        case QuestionType.Number:
          handleQuestionChange({
            ...base,
            allowDecimals: false,
            maxValue: 10,
            minValue: 0,
            placeholder: "",
            title: "Number question",
            type: QuestionType.Number,
          });
          break;

        case QuestionType.Country:
          handleQuestionChange({
            ...base,
            title: "Country question",
            type: QuestionType.Country,
          });
          break;

        case QuestionType.Choices:
          handleQuestionChange({
            ...base,
            allowMultiple: true,
            choices: [],
            displayAsDropdown: false,
            title: "Choice question",
            type: QuestionType.Choices,
          });
          break;
      }
    };

    return (
      <>
        <Meta>
          <Row>
            <Col percent={50}>
              <Select
                onChange={handleQuestionTypeChange}
                value={question.type}
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
                onChange={(title) => handleQuestionChange({ title })}
                placeholder="no title"
                title="Title"
              />
            </Col>
          </Row>

          <Row>
            <Col percent={50}>
              <TextInput
                value={question.description}
                onChange={(description) => handleQuestionChange({ description })}
                placeholder="no description"
                title="Description"
                type={TextInputType.Area}
              />
            </Col>
            <Col percent={50}>
              <Checkboxes
                values={[mandatoryOptionName]}
                selected={question.mandatory ? [mandatoryOptionName] : []}
                onChange={(selected) => handleQuestionChange({ mandatory: selected.includes(mandatoryOptionName) })}
                title="Behaviour"
              />
            </Col>
          </Row>

          <TextInput
            value={question.referenceName!}
            onChange={(referenceName) => handleQuestionChange({ referenceName })}
            title="Reference name"
            placeholder="no reference name"
            mandatory={true}
          />

          <Row>
            <Col percent={50}>
              <TextInput
                value={question.parentReferenceName!}
                onChange={(parentReferenceName) => handleQuestionChange({ parentReferenceName })}
                title="Parent question reference name"
                placeholder="no parent question"
              />
            </Col>

            <Col percent={50}>
              <TextInput
                value={question.showIfParentHasValue!}
                onChange={(showIfParentHasValue) => handleQuestionChange({ showIfParentHasValue })}
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
      <ReactMarkdown
        source={question.description}
        linkTarget="_blank"
      />

      {renderedQuestion}
    </>
  );
};
