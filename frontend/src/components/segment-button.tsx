import styled from "@emotion/styled";
import * as React from "react";
import { useState } from "react";
import { borderRadius } from "../config";
import { variables } from "../theme";

const Container = styled.div`
  display: inline-block;
  border: 1px solid ${variables.colorGradientEnd};
  border-radius: ${borderRadius};
  overflow: hidden;
  font-size: 0.6rem;

  &::after {
    content: " ";
    display: table;
    clear: both;
  }
`;

interface ISegmentedButtonProps {
  active: boolean;
}

const SegmentedButton = styled.div<ISegmentedButtonProps>`
  display: block;
  padding: 0.2rem 0.5rem;
  float: left;

  border: none;
  background-color: white;
  color: ${variables.colorGradientEnd};

  ${(props: ISegmentedButtonProps) =>
    props.active &&
    `
    background-color: ${variables.colorGradientEnd};
    color: white;
  `}

  font-weight: bold;
  text-transform: uppercase;
  cursor: pointer;
`;

interface ISegmentButtonProps {
  choices: string[];
  onChoiceChanged: (choice: string) => any;
}

/**
 * A segmented button control, similar to iOS.
 */
export const SegmentButton = ({
  choices,
  onChoiceChanged,
}: ISegmentButtonProps) => {
  const [choice, setChoice] = useState(choices[0]);
  const buttons = choices.map((text) => (
    <SegmentedButton
      key={text}
      onClick={() => onChoiceChanged(text) || setChoice(text)}
      active={choice === text}
    >
      {text}
    </SegmentedButton>
  ));

  return <Container>{buttons}</Container>;
};
