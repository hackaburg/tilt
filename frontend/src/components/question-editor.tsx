import styled from "@emotion/styled";
import * as React from "react";
import { useCallback } from "react";
import FlexView from "react-flexview";
import type { QuestionDTO } from "../api/types/dto";
import { transitionDuration } from "../config";
import { useFortune } from "../hooks/use-fortune";
import { useToggle } from "../hooks/use-toggle";
import { variables } from "../theme";
import { UnifiedQuestion } from "./questions/unified-question";
import { UnifiedQuestionEditor } from "./questions/unified-question-editor";

const MetaButton = styled.button`
  border: none;
  background: transparent;
  cursor: pointer;
  text-transform: uppercase;
  color: currentColor;
  font-weight: bold;
`;

const RemoveButton = styled(MetaButton)`
  color: red;
  transition-property: opacity;
  transition-duration: ${transitionDuration};
  opacity: 0.3;

  &:hover {
    opacity: 1;
  }
`;

const FinishButton = styled(MetaButton)`
  color: ${variables.colorGradientStart};
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
  const [isEditing, toggleEditing] = useToggle(false);
  const fortune = useFortune();

  const handleDelete = useCallback(() => {
    onDeleteQuestion(question);
  }, [onDeleteQuestion, question]);

  return (
    <FlexView column grow>
      <FlexView hAlignContent="right">
        {isEditing ? (
          <FlexView>
            <RemoveButton onClick={handleDelete}>Delete question</RemoveButton>
            <FinishButton onClick={toggleEditing}>Finish editing</FinishButton>
          </FlexView>
        ) : (
          <MetaButton onClick={toggleEditing}>Edit</MetaButton>
        )}
      </FlexView>

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
    </FlexView>
  );
};
