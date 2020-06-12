import styled from "@emotion/styled";
import { v4 as uuid } from "node-uuid";
import { useState } from "react";
import * as React from "react";
import { FormSettingsDTO, QuestionDTO, QuestionType } from "../api/types";
import { Button } from "./button";
import { EditableQuestion } from "./editable-question";
import { Col, Row } from "./grid";
import { Sectionheading } from "./headings";
import { TextInput } from "./text-input";

const Section = styled.section`
  margin-bottom: 2rem;
`;

const AddButtonContainer = styled.div`
  display: inline-block;
  margin-left: 1rem;
  margin-top: 1rem;
  transform: scale(0.8);
  vertical-align: center;
`;

const Muted = styled.p`
  padding: 1rem 0rem;
  color: #ccc;
`;

interface IIdentifiableIQuestion {
  id: string;
  question: QuestionDTO;
}

interface IFormEditorProps {
  initialForm: FormSettingsDTO;
  onFormChange: (form: FormSettingsDTO) => any;
}

/**
 * An editor to edit an editable collection of questions, only for editing.
 */
export const FormEditor = ({ initialForm, onFormChange }: IFormEditorProps) => {
  const initialQuestionsWithUUIDs = initialForm.questions.map<
    IIdentifiableIQuestion
  >((question) => ({
    id: uuid(),
    question,
  }));

  const [questions, setQuestions] = useState(initialQuestionsWithUUIDs);
  const [title, setTitle] = useState(initialForm.title);

  const updateQuestions = (updatedQuestions: IIdentifiableIQuestion[]) => {
    setQuestions(updatedQuestions);
    onFormChange({
      questions: updatedQuestions.map(({ question }) => question),
      title,
    });
  };

  const addQuestion = () => {
    const textQuestion: QuestionDTO = {
      configuration: {
        convertAnswerToUrl: false,
        multiline: false,
        placeholder: "",
        type: QuestionType.Text,
      },
      description: "A new question",
      mandatory: false,
      parentID: undefined,
      showIfParentHasValue: undefined,
      title: `Question ${questions.length + 1}`,
    };

    updateQuestions([
      ...questions,
      {
        id: uuid(),
        question: textQuestion,
      },
    ]);
  };

  const handleQuestionChange = (
    changes: Partial<QuestionDTO>,
    index: number,
  ) => {
    const updatedQuestions = [...questions];

    updatedQuestions[index] = {
      ...updatedQuestions[index],
      question: {
        ...updatedQuestions[index].question,
        ...(changes as QuestionDTO),
      },
    };

    updateQuestions(updatedQuestions);
  };

  const handleDeleteQuestion = (index: number) => {
    const updatedQuestions = [...questions];

    updatedQuestions.splice(index, 1);
    updateQuestions(updatedQuestions);
  };

  const handleTitleChange = (updatedTitle: string) => {
    setTitle(updatedTitle);
    onFormChange({
      questions: questions.map(({ question }) => question),
      title: updatedTitle,
    });
  };

  const editableQuestions = questions.map(({ question, id }, index) => (
    <EditableQuestion
      key={id}
      onQuestionChange={(changes) => handleQuestionChange(changes, index)}
      question={question}
      onDeleteQuestion={() => handleDeleteQuestion(index)}
    />
  ));

  return (
    <Section>
      <Sectionheading>
        <Row>
          <Col percent={50}>
            <TextInput
              value={title}
              onChange={handleTitleChange}
              title="Form title"
            />
          </Col>

          <Col percent={50}>
            <AddButtonContainer>
              <Button onClick={addQuestion} primary>
                Add question
              </Button>
            </AddButtonContainer>
          </Col>
        </Row>
      </Sectionheading>

      {questions.length === 0 && (
        <Muted>No questions yet. Go ahead and add some.</Muted>
      )}

      {editableQuestions}
    </Section>
  );
};
