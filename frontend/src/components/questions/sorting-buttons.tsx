import styled from "@emotion/styled";
import * as React from "react";
import { FlexColumnContainer } from "../base/flex";

const Button = styled.button`
  cursor: pointer;
  background: transparent;
  border: 0px;
`;

const Icon = styled.span`
  border: solid black;
  border-width: 0 2px 2px 0;
  display: inline-block;
  padding: 3px;
`;

interface IArrowProps {
  isUpwardsFacing: boolean;
}

const Arrow = ({ isUpwardsFacing }: IArrowProps) => (
  <Icon
    style={{ transform: `rotate(${isUpwardsFacing ? "-135deg" : "45deg"}` }}
  />
);

interface ISortingButtonProps {
  onClickMoveUp: () => void;
  onClickMoveDown: () => void;
}

/**
 * Arrows up and down to change ordering of questions.
 */
export const SortingButtons = ({
  onClickMoveDown,
  onClickMoveUp,
}: ISortingButtonProps) => (
  <FlexColumnContainer>
    <Button onClick={() => onClickMoveUp()}>
      <Arrow isUpwardsFacing={true} />
    </Button>
    <Button onClick={() => onClickMoveDown()}>
      <Arrow isUpwardsFacing={false} />
    </Button>
  </FlexColumnContainer>
);
