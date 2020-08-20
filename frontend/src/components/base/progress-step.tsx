import styled from "@emotion/styled";
import * as React from "react";
import {
  CenteredContainer,
  FlexColumnContainer,
  FlexRowColumnContainer,
  FlexRowContainer,
  Spacer,
  StyleableFlexContainer,
} from "./flex";
import { Subheading } from "./headings";

const StepContainer = styled(StyleableFlexContainer)`
  padding-top: 0.5rem;
`;

const StepIndex = styled(StyleableFlexContainer)`
  font-weight: bold;
  border-radius: 10rem;
  border: 1px dashed #333;
  width: 2rem;
  height: 2rem;
`;

/**
 * Indicates the state of a progress step.
 */
export enum ProgressStepState {
  Pending,
  Completed,
  Failed,
}

const completedStyle: React.CSSProperties = {
  backgroundColor: "#56d175",
  border: "none",
  color: "white",
};

const failedStyle: React.CSSProperties = {
  backgroundColor: "#ff5086",
  border: "none",
  color: "white",
};

interface IProgressStepProps {
  children: React.ReactNode;
  index: number;
  state: ProgressStepState;
  title: string;
}

/**
 * A step in a progress stepper.
 */
export const ProgressStep = ({
  children,
  index,
  state,
  title,
}: IProgressStepProps) => (
  <FlexColumnContainer>
    <Spacer />

    <FlexRowContainer>
      <StepContainer>
        <StepIndex
          style={
            state === ProgressStepState.Completed
              ? completedStyle
              : state === ProgressStepState.Failed
              ? failedStyle
              : undefined
          }
        >
          <CenteredContainer>{index}</CenteredContainer>
        </StepIndex>
      </StepContainer>

      <Spacer />

      <FlexRowColumnContainer>
        <Subheading text={title} />

        {children}
      </FlexRowColumnContainer>
    </FlexRowContainer>
  </FlexColumnContainer>
);
