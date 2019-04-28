import { v4 as uuid } from "node-uuid";
import * as React from "react";
import { useState } from "react";
import styled from "styled-components";
import { IQuestion, ITextQuestion, QuestionType } from "../../../types/questions";
import { Button } from "./button";
import { EditableQuestion } from "./editable-question";
import { Sectionheading } from "./headings";

const Section = styled.section`
  margin-bottom: 2rem;
`;

const AddButtonContainer = styled.div`
  display: inline-block;
  margin-left: 1rem;
  transform: scale(0.8);
  vertical-align: center;
`;

const Muted = styled.p`
  padding: 1rem 0rem;
  color: #ccc;
`;

interface IIdentifiableIQuestion {
  id: string;
  question: IQuestion;
}

interface IFormEditorProps {
  heading: string;
  initialQuestions: IQuestion[];
  onQuestionsChange: (questions: IQuestion[]) => any;
}

/**
 * An editor to edit an editable collection of questions, only for editing.
 */
export const FormEditor = ({ heading, initialQuestions, onQuestionsChange }: IFormEditorProps) => {
  const initialQuestionsWithUUIDs = initialQuestions.map<IIdentifiableIQuestion>((question) => ({
    id: uuid(),
    question,
  }));

  const [questions, setQuestions] = useState(initialQuestionsWithUUIDs);
  const updateQuestions = (updatedQuestions: IIdentifiableIQuestion[]) => {
    setQuestions(updatedQuestions);
    onQuestionsChange(updatedQuestions.map(({ question }) => question));
  };

  const addQuestion = () => {
    const textQuestion: ITextQuestion = {
      description: "A new question",
      mandatory: false,
      multiline: false,
      parentQuestionReferenceName: "",
      placeholder: "",
      referenceName: "",
      showIfParentQuestionHasValue: "",
      title: `Question ${questions.length + 1}`,
      type: QuestionType.Text,
    };

    updateQuestions([
      ...questions,
      {
        id: uuid(),
        question: textQuestion,
      },
    ]);
  };

  const handleQuestionChange = (changes: Partial<IQuestion>, index: number) => {
    const updatedQuestions = [
      ...questions,
    ];

    updatedQuestions[index] = {
      ...updatedQuestions[index],
      question: {
        ...updatedQuestions[index].question,
        ...changes as IQuestion,
      },
    };

    updateQuestions(updatedQuestions);
  };

  const handleDeleteQuestion = (index: number) => {
    const updatedQuestions = [
      ...questions,
    ];

    updatedQuestions.splice(index, 1);
    updateQuestions(updatedQuestions);
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
        {heading}
        <AddButtonContainer>
          <Button
            onClick={addQuestion}
            primary
          >Add question</Button>
        </AddButtonContainer>
      </Sectionheading>

      {questions.length === 0 && (
        <Muted>No questions yet. Go ahead and add some.</Muted>
      )}

      {editableQuestions}
    </Section>
  );
};
