import styled from "@emotion/styled";
import { useCallback } from "react";
import * as React from "react";
import FlexView from "react-flexview";
import type { FormSettingsDTO, QuestionDTO } from "../../api/types/dto";
import { QuestionType } from "../../api/types/enums";
import { Button } from "../base/button";
import { Divider } from "../base/divider";
import { Elevated } from "../base/elevated";
import { Subsubheading } from "../base/headings";
import { Muted } from "../base/muted";
import { TextInput } from "../base/text-input";
import { QuestionEditor } from "./question-editor";

const FormEditorContainer = styled(Elevated)`
  padding: 1rem;
`;

const TitleEditorContainer = styled(FlexView)`
  padding-bottom: 1rem;
`;

const AddQuestionContainer = styled(FlexView)`
  padding-left: 1rem;
  padding-bottom: 1.25rem;
`;

interface IFormEditorProps {
  heading: string;
  form: FormSettingsDTO;
  onFormChange: (form: FormSettingsDTO) => any;
}

/**
 * An editor to edit an editable collection of questions, only for editing.
 */
export const FormEditor = ({
  heading,
  form,
  onFormChange,
}: IFormEditorProps) => {
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
      id: null,
      mandatory: false,
      parentID: null,
      showIfParentHasValue: null,
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
    <FlexView key={question.id ?? question.title} column shrink={false}>
      <Divider />

      <QuestionEditor
        onQuestionChange={handleQuestionChange}
        question={question}
        onDeleteQuestion={handleDeleteQuestion}
        allQuestions={form.questions}
      />
    </FlexView>
  ));

  return (
    <FormEditorContainer level={1}>
      <Subsubheading>{heading}</Subsubheading>

      <TitleEditorContainer vAlignContent="bottom">
        <FlexView column grow>
          <TextInput
            value={form.title}
            onChange={handleTitleChange}
            title="Form title"
          />
        </FlexView>

        <AddQuestionContainer column shrink>
          <Button onClick={handleAddQuestion} primary>
            Add question
          </Button>
        </AddQuestionContainer>
      </TitleEditorContainer>

      {form.questions.length === 0 && (
        <Muted>No questions yet. Go ahead and add some.</Muted>
      )}

      {allQuestionsHaveIDs ? (
        editableQuestions
      ) : (
        <Muted>Preparing questions, just a sec</Muted>
      )}
    </FormEditorContainer>
  );
};
