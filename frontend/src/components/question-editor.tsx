import styled from "@emotion/styled";
import * as React from "react";
import { useCallback, useState } from "react";
import type { QuestionDTO } from "../api/types/dto";
import { borderRadius, transitionDuration } from "../config";
import { useFortune } from "../hooks/use-fortune";
import { variables } from "../theme";
import { UnifiedQuestion } from "./questions/unified-question";
import { UnifiedQuestionEditor } from "./questions/unified-question-editor";

const Container = styled.div`
  position: relative;

  padding: 1rem 2rem;
  border-radius: ${borderRadius};
  background-color: white;
  box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.05);

  border-top-left-radius: 0px;
  border-top-right-radius: 0px;
  border-top: 1px dashed #eee;
`;

const Modifiers = styled.div`
  position: absolute;
  top: 1rem;
  right: 2rem;
`;

interface IEditQuestionButtonProps {
  active: boolean;
}

const EditButton = styled.button<IEditQuestionButtonProps>`
  display: inline-block;
  border: none;
  background: transparent;
  cursor: pointer;
  text-transform: uppercase;
  color: currentColor;
  opacity: 0.3;
  font-weight: bold;

  transition-property: opacity;
  transition-duration: ${transitionDuration};

  &:hover {
    opacity: 1;
  }

  ${({ active }: IEditQuestionButtonProps) =>
    active &&
    `
    color: ${variables.colorGradientEnd};
    opacity: 1;
  `}
`;

const RemoveButton = styled.button`
  display: inline-block;
  border: none;
  background-color: transparent;
  cursor: pointer;
  text-transform: uppercase;
  color: red;
  font-weight: bold;
  opacity: 0.3;
  transition-property: opacity;
  transition-duration: ${transitionDuration};

  &:hover {
    opacity: 1;
  }
`;

const ignoreChange = () => 0;

interface IQuestionEditorProps {
  question: QuestionDTO;
  onQuestionChange: (question: QuestionDTO) => any;
  onDeleteQuestion: (question: QuestionDTO) => any;
  allQuestions: readonly QuestionDTO[];
}

/**
 * A question with an "Edit" and "Delete" button, and mock content.
 */
export const QuestionEditor = ({
  question,
  onQuestionChange,
  onDeleteQuestion,
  allQuestions,
}: IQuestionEditorProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const fortune = useFortune();

  const handleDelete = useCallback(() => {
    onDeleteQuestion(question);
  }, [onDeleteQuestion, question]);

  return (
    <Container>
      {isEditing ? (
        <UnifiedQuestionEditor
          question={question}
          onQuestionChange={onQuestionChange}
          allQuestions={allQuestions}
        />
      ) : (
        <UnifiedQuestion
          question={question}
          value={fortune}
          onChange={ignoreChange}
        />
      )}

      <Modifiers>
        {isEditing && (
          <RemoveButton onClick={handleDelete}>Delete question</RemoveButton>
        )}

        <EditButton
          active={isEditing}
          onClick={() => setIsEditing((value) => !value)}
        >
          {isEditing ? "Finish Editing" : "Edit"}
        </EditButton>
      </Modifiers>
    </Container>
  );
};
