import styled from "@emotion/styled";
import * as React from "react";
import { useCallback, useMemo } from "react";
import { IQuestionConfiguration } from "../../../../backend/src/entities/question";
import { enforceExhaustiveSwitch } from "../../../../backend/src/utils/switch";
import {
  ChoicesQuestionConfigurationDTO,
  NumberQuestionConfigurationDTO,
  QuestionDTO,
  TextQuestionConfigurationDTO,
} from "../../api/types/dto";
import { QuestionType } from "../../api/types/enums";
import { Nullable } from "../../util";
import { Checkboxes } from "../base/checkbox";
import { Spacer, StyleableFlexContainer } from "../base/flex";
import { FlexRowColumnContainer, FlexRowContainer } from "../base/flex";
import { SelectWrapper } from "../base/select";
import { TextInput, TextInputType } from "../base/text-input";
import { ChoicesQuestionEditor } from "./choices-question-editor";
import { CountryQuestionEditor } from "./country-question-editor";
import { NumberQuestionEditor } from "./number-question-editor";
import { TextQuestionEditor } from "./text-question-editor";

const Meta = styled(StyleableFlexContainer)`
  padding-bottom: 3rem;
`;

interface IQuestionEditorProps {
  question: QuestionDTO;
  onQuestionChange: (question: QuestionDTO) => any;
}

const QuestionEditor = ({
  question,
  onQuestionChange,
}: IQuestionEditorProps) => {
  const type = question.configuration.type;

  switch (type) {
    case QuestionType.Text:
      return (
        <TextQuestionEditor
          question={question as QuestionDTO<TextQuestionConfigurationDTO>}
          onQuestionChange={onQuestionChange}
        />
      );

    case QuestionType.Number:
      return (
        <NumberQuestionEditor
          question={question as QuestionDTO<NumberQuestionConfigurationDTO>}
          onQuestionChange={onQuestionChange}
        />
      );

    case QuestionType.Choices:
      return (
        <ChoicesQuestionEditor
          question={question as QuestionDTO<ChoicesQuestionConfigurationDTO>}
          onQuestionChange={onQuestionChange}
        />
      );

    case QuestionType.Country:
      return <CountryQuestionEditor />;

    default:
      enforceExhaustiveSwitch(type);
      throw new Error(`unknown question editor type ${type}`);
  }
};

const getDefaultQuestionConfiguration = (
  type: string,
): IQuestionConfiguration => {
  switch (type) {
    case QuestionType.Text:
      return {
        convertAnswerToUrl: false,
        multiline: false,
        placeholder: "",
        type: QuestionType.Text,
      };

    case QuestionType.Number:
      return {
        allowDecimals: false,
        maxValue: 10,
        minValue: 0,
        placeholder: "",
        type: QuestionType.Number,
      };

    case QuestionType.Country:
      return {
        type: QuestionType.Country,
      };

    case QuestionType.Choices:
      return {
        allowMultiple: true,
        choices: [],
        displayAsDropdown: false,
        type: QuestionType.Choices,
      };

    default:
      throw new Error(`unknown question type '${type}'`);
  }
};

const availableQuestionTypes = [
  QuestionType.Text,
  QuestionType.Number,
  QuestionType.Country,
  QuestionType.Choices,
];

const mandatoryOptionName = "Mandatory";
const mandatoryAllCheckboxOptions = [mandatoryOptionName];
const mandatorySelectedCheckboxOptions = mandatoryAllCheckboxOptions;
const mandatoryNotSelectedCheckboxOptions = [] as string[];

interface IChoiceWithID {
  id: Nullable<number>;
  title: string;
}

interface IUnifiedQuestionEditorProps {
  question: QuestionDTO;
  onQuestionChange: (question: QuestionDTO) => any;
  allQuestions: readonly QuestionDTO[];
}

/**
 * A unified editor for all questions.
 */
export const UnifiedQuestionEditor = ({
  question,
  onQuestionChange,
  allQuestions,
}: IUnifiedQuestionEditorProps) => {
  const handleQuestionFieldChange = useCallback(
    (changes: Partial<QuestionDTO>) => {
      if (!onQuestionChange) {
        return;
      }

      onQuestionChange({
        ...question,
        ...changes,
      });
    },
    [onQuestionChange, question],
  );

  const handleQuestionTypeChange = useCallback(
    (type: string) => {
      const configuration = getDefaultQuestionConfiguration(type);
      handleQuestionFieldChange({ configuration });
    },
    [handleQuestionFieldChange],
  );

  const handleQuestionTitleChange = useCallback(
    (title: string) => handleQuestionFieldChange({ title }),
    [handleQuestionFieldChange],
  );

  const handleQuestionDescriptionChange = useCallback(
    (description: string) => handleQuestionFieldChange({ description }),
    [handleQuestionFieldChange],
  );

  const handleQuestionMandatoryChange = useCallback(
    (selected: string[]) =>
      handleQuestionFieldChange({
        mandatory: selected.includes(mandatoryOptionName),
      }),
    [handleQuestionFieldChange, mandatoryOptionName],
  );

  const [parentChoices, parentChoicesWithIDs] = useMemo(() => {
    const questionsWithoutSelf = allQuestions.filter(
      ({ id }) => question.id !== id,
    );

    const questionChoicesWithID = questionsWithoutSelf.map(({ id, title }) => ({
      id,
      title: `${id} - ${title}`,
    }));

    const choicesWithID: readonly IChoiceWithID[] = [
      { id: null, title: "No parent question" },
      ...questionChoicesWithID,
    ];

    const choiceTitles = choicesWithID.map(({ title }) => title);

    return [choiceTitles, choicesWithID];
  }, [allQuestions, question]);

  const currentParentChoice =
    parentChoicesWithIDs.find(({ id }) => id === question.parentID)?.title ??
    parentChoices[0];

  const handleQuestionParentIDChange = useCallback(
    (value: string) => {
      const parentID =
        parentChoicesWithIDs.find(({ title }) => title === value)?.id ?? null;

      handleQuestionFieldChange({
        parentID,
      });
    },
    [handleQuestionFieldChange],
  );

  const handleQuestionParentValueChange = useCallback(
    (value: string) => {
      const trimmed = value.trim();
      handleQuestionFieldChange({
        showIfParentHasValue: trimmed === "" ? null : trimmed,
      });
    },
    [handleQuestionFieldChange],
  );

  return (
    <>
      <Meta>
        <FlexRowContainer>
          <FlexRowColumnContainer>
            <SelectWrapper
              onChange={handleQuestionTypeChange}
              value={question.configuration.type}
              values={availableQuestionTypes}
              title="Question type"
              description={question.description}
            />
          </FlexRowColumnContainer>
          <Spacer />
          <FlexRowColumnContainer>
            <TextInput
              value={question.title}
              onChange={handleQuestionTitleChange}
              placeholder="Title"
              title="Title"
            />
          </FlexRowColumnContainer>
        </FlexRowContainer>

        <FlexRowContainer>
          <FlexRowColumnContainer>
            <TextInput
              value={question.description}
              onChange={handleQuestionDescriptionChange}
              placeholder="Description"
              title="Description"
              type={TextInputType.Area}
            />
          </FlexRowColumnContainer>
          <Spacer />
          <FlexRowColumnContainer>
            <Checkboxes
              values={mandatoryAllCheckboxOptions}
              selected={
                question.mandatory
                  ? mandatorySelectedCheckboxOptions
                  : mandatoryNotSelectedCheckboxOptions
              }
              onChange={handleQuestionMandatoryChange}
              title="Behaviour"
            />
          </FlexRowColumnContainer>
        </FlexRowContainer>

        <FlexRowContainer>
          <FlexRowColumnContainer>
            <SelectWrapper
              values={parentChoices}
              value={currentParentChoice}
              onChange={handleQuestionParentIDChange}
              title="Parent question"
              description={question.description}
            />
          </FlexRowColumnContainer>
          <Spacer />
          <FlexRowColumnContainer>
            <TextInput
              value={question.showIfParentHasValue ?? ""}
              onChange={handleQuestionParentValueChange}
              title="Only show this question if the parent question has this value"
              placeholder="no value"
            />
          </FlexRowColumnContainer>
        </FlexRowContainer>
      </Meta>

      <QuestionEditor question={question} onQuestionChange={onQuestionChange} />
    </>
  );
};
