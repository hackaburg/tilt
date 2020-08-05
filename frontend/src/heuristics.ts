import { QuestionDTO } from "./api/types/dto";
import { QuestionType } from "./api/types/enums";

/**
 * A heuristic to determine whether a question is used to query for a user's name.
 * @param question The question to check
 */
export const isNameQuestion = (question: QuestionDTO): boolean => {
  return (
    question.title.toLowerCase().includes("name") &&
    question.configuration.type === QuestionType.Text &&
    question.mandatory &&
    question.parentID == null
  );
};
