import styled from "@emotion/styled";
import * as React from "react";
import FlexView from "react-flexview";
import { Subheading } from "./headings";

const StepContainer = styled(FlexView)`
  padding-top: 0.5rem;
`;

const StepIndex = styled(FlexView)`
  font-weight: bold;
  background-color: #333;
  color: white;
  border-radius: 10rem;
`;

/**
 * Indicates the state of a progress step.
 */
export enum ProgressStepState {
  Pending,
  Completed,
  Failed,
}

interface IProgressStepProps {
  children: FlexView.Props["children"];
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
  <FlexView column>
    <FlexView height="2rem" shrink={false} />

    <FlexView vAlignContent="top">
      <StepContainer shrink={false} column>
        <StepIndex
          vAlignContent="center"
          hAlignContent="center"
          width="2rem"
          height="2rem"
          style={{
            backgroundColor:
              state === ProgressStepState.Completed
                ? "#56d175"
                : state === ProgressStepState.Failed
                ? "#ff5086"
                : undefined,
          }}
        >
          {index}
        </StepIndex>
      </StepContainer>

      <FlexView width="1rem" shrink={false} />

      <FlexView column grow>
        <Subheading>{title}</Subheading>

        {children}
      </FlexView>
    </FlexView>
  </FlexView>
);
