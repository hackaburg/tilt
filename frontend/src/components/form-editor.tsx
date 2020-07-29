import styled from "@emotion/styled";
import { useCallback } from "react";
import * as React from "react";
import type { FormSettingsDTO, QuestionDTO } from "../api/types/dto";
import { QuestionType } from "../api/types/enums";
import { Button } from "./button";
import { Col, Row } from "./grid";
import { Sectionheading } from "./headings";
import { QuestionEditor } from "./question-editor";
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

interface IFormEditorProps {
  form: FormSettingsDTO;
  onFormChange: (form: FormSettingsDTO) => any;
}

/**
 * An editor to edit an editable collection of questions, only for editing.
 */
export const FormEditor = ({ form, onFormChange }: IFormEditorProps) => {
  const handleFormFieldChange = useCallback(
    (changes: Partial<FormSettingsDTO>) => {
      onFormChange({
        ...form,
        ...changes,
      });
    },
    [onFormChange, form],
  );

  const handleQuestionChange = useCallback(
    (changedQuestion: QuestionDTO) => {
      const updatedQuestions = form.questions.map((question) => {
        if (question.id !== changedQuestion.id) {
          return question;
        }

        return changedQuestion;
      });

      handleFormFieldChange({ questions: updatedQuestions });
    },
    [handleFormFieldChange],
  );

  const handleTitleChange = useCallback(
    (title) => handleFormFieldChange({ title }),
    [handleFormFieldChange],
  );

  const handleAddQuestion = useCallback(() => {
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
      title: `Question ${form.questions.length + 1}`,
    };

    handleFormFieldChange({ questions: [...form.questions, textQuestion] });
  }, [handleFormFieldChange, form]);

  const handleDeleteQuestion = useCallback(
    (question: QuestionDTO) => {
      const updatedQuestions = form.questions.filter(
        ({ id }) => question.id !== id,
      );

      handleFormFieldChange({ questions: updatedQuestions });
    },
    [handleFormFieldChange, form],
  );

  const allQuestionsHaveIDs = form.questions.every(({ id }) => id != null);

  const editableQuestions = form.questions.map((question) => (
    <QuestionEditor
      key={question.id ?? question.title}
      onQuestionChange={handleQuestionChange}
      question={question}
      onDeleteQuestion={handleDeleteQuestion}
    />
  ));

  return (
    <Section>
      <Sectionheading>
        <Row>
          <Col percent={50}>
            <TextInput
              value={form.title}
              onChange={handleTitleChange}
              title="Form title"
            />
          </Col>

          <Col percent={50}>
            <AddButtonContainer>
              <Button onClick={handleAddQuestion} primary>
                Add question
              </Button>
            </AddButtonContainer>
          </Col>
        </Row>
      </Sectionheading>

      {form.questions.length === 0 && (
        <Muted>No questions yet. Go ahead and add some.</Muted>
      )}

      {allQuestionsHaveIDs ? (
        editableQuestions
      ) : (
        <Muted>Preparing questions, just a sec</Muted>
      )}
    </Section>
  );
};
