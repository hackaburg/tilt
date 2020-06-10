import * as React from "react";
import {
  IQuestion,
  ITextQuestionConfiguration,
} from "../../../types/questions";
import { Checkboxes } from "./checkbox";
import { Col, Row } from "./grid";
import { TextInput, TextInputType } from "./text-input";

interface ITextQuestionProps {
  editable?: boolean;
  question: IQuestion<ITextQuestionConfiguration>;
  onQuestionChange?: (updatedQuestion: Partial<IQuestion>) => any;

  value: string;
  onChange: (value: string) => any;
}

/**
 * An editable text question.
 */
export const TextQuestion = ({
  question,
  onQuestionChange,
  editable,
  value,
  onChange,
}: ITextQuestionProps) => {
  if (editable && onQuestionChange) {
    const multilineOptionValue = "Multiline";
    const convertToUrlOptionValue = "Convert answer to URL";

    const appearanceOptions = [multilineOptionValue, convertToUrlOptionValue];

    const selectedAppearanceOptions = [
      ...(question.configuration.multiline ? [multilineOptionValue] : []),
      ...(question.configuration.convertAnswerToUrl
        ? [convertToUrlOptionValue]
        : []),
    ];

    const handleAppearanceChange = (selected: string[]) => {
      onQuestionChange({
        configuration: {
          ...question.configuration,
          convertAnswerToUrl: selected.includes(convertToUrlOptionValue),
          multiline: selected.includes(multilineOptionValue),
        },
      });
    };

    return (
      <>
        <Row>
          <Col percent={50}>
            <TextInput
              value={question.configuration.placeholder}
              onChange={(placeholder) =>
                onQuestionChange({
                  configuration: {
                    ...question.configuration,
                    placeholder,
                  },
                })
              }
              placeholder="no placeholder"
              title="Input placeholder"
            />
          </Col>

          <Col percent={50}>
            <Checkboxes
              onChange={handleAppearanceChange}
              selected={selectedAppearanceOptions}
              values={appearanceOptions}
              title="Appearance"
            />
          </Col>
        </Row>
      </>
    );
  }

  return (
    <TextInput
      onChange={onChange}
      value={value}
      placeholder={question.configuration.placeholder}
      title={question.title}
      mandatory={question.mandatory}
      type={
        question.configuration.multiline
          ? TextInputType.Area
          : TextInputType.Text
      }
    />
  );
};
