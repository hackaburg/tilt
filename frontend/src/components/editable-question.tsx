import styled from "@emotion/styled";
import * as React from "react";
import { useState } from "react";
import { IQuestion } from "../../../types/questions";
import { borderRadius, transitionDuration } from "../config";
import { randomFortune } from "../fortunes";
import { variables } from "../theme";
import { Question } from "./question";

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

interface IEditableQuestion {
  question: IQuestion;
  onQuestionChange: (changes: Partial<IQuestion>) => any;
  onDeleteQuestion: () => any;
}

/**
 * A question with an "Edit" and "Delete" button, and mock content.
 */
export const EditableQuestion = ({
  question,
  onQuestionChange,
  onDeleteQuestion,
}: IEditableQuestion) => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <Container>
      <Question
        question={question}
        onQuestionChange={onQuestionChange}
        editable={isEditing}
        value={randomFortune()}
        onChange={() => 0}
      />
      <Modifiers>
        {isEditing && (
          <RemoveButton onClick={onDeleteQuestion}>
            Delete question
          </RemoveButton>
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
