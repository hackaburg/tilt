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

const StepConnector = styled(StyleableFlexContainer)`
  position: relative;

  :after {
    position: absolute;
    left: 0.6rem;
    top: 3rem;
    content: "";
    border-left: 2px dashed grey;
    margin-left: 5px;
    height: 100%;
  }

  :last-child:after {
    display: none;
  }
`;

const StepContainer = styled(StyleableFlexContainer)`
  position: relative;
`;

const StepIndex = styled(StyleableFlexContainer)`
  font-weight: bold;
  border-radius: 10rem;
  border: 1px dashed #333;
  width: 2rem;
  height: 2rem;
  background-color: white;
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
  backgroundColor: "#3fb28f",
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
  <StepConnector
    className={
      state === ProgressStepState.Completed
        ? "completedStepConnector"
        : "pendingStepConnector"
    }
  >
    <style>{`
      .pendingStepConnector:after {
        border-left: 2px dashed grey;
      }

      .completedStepConnector:after {
        border-left: 2px solid #3fb28f;
      }
    `}</style>
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
          <h2 style={{ marginTop: "-0.2rem" }}>{title}</h2>
          {children}
        </FlexRowColumnContainer>
        <Spacer /> <Spacer />
      </FlexRowContainer>
    </FlexColumnContainer>
  </StepConnector>
);
