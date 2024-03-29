import styled from "@emotion/styled";
import * as React from "react";
import { useCallback } from "react";
import type { QuestionDTO } from "../../api/types/dto";
import { transitionDuration } from "../../config";
import { useFortune } from "../../hooks/use-fortune";
import { useToggle } from "../../hooks/use-toggle";
import { variables } from "../../theme";
import {
  FlexColumnContainer,
  FlexRowContainer,
  Spacer,
  StyleableFlexContainer,
} from "../base/flex";
import { SortingButtons } from "../forms/sorting-buttons";
import { UnifiedQuestion } from "../forms/unified-question";
import { UnifiedQuestionEditor } from "../forms/unified-question-editor";
import { SimpleCard } from "../base/simple-card";

const ButtonContainer = styled(StyleableFlexContainer)`
  align-self: flex-end;
`;

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
  onMoveUp: () => void;
  onMoveDown: () => void;
}

/**
 * A question with an "Edit" and "Delete" button, and mock content.
 */
export const QuestionEditor = ({
  question,
  onQuestionChange,
  onDeleteQuestion,
  allQuestions,
  onMoveDown,
  onMoveUp,
}: IQuestionEditorProps) => {
  const [isEditing, toggleEditing] = useToggle(false);
  const fortune = useFortune();

  const handleDelete = useCallback(() => {
    onDeleteQuestion(question);
  }, [onDeleteQuestion, question]);

  return (
    <SimpleCard>
      <FlexColumnContainer>
        <ButtonContainer>
          <FlexRowContainer>
            <SortingButtons
              onClickMoveDown={onMoveDown}
              onClickMoveUp={onMoveUp}
            />

            <Spacer />

            {isEditing ? (
              <>
                <RemoveButton onClick={handleDelete}>
                  Delete question
                </RemoveButton>
                <FinishButton onClick={toggleEditing}>
                  Finish editing
                </FinishButton>
              </>
            ) : (
              <MetaButton onClick={toggleEditing}>Edit</MetaButton>
            )}
          </FlexRowContainer>
        </ButtonContainer>

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
      </FlexColumnContainer>
    </SimpleCard>
  );
};
