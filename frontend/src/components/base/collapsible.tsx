import styled from "@emotion/styled";
import * as React from "react";
import { useCallback } from "react";
import { useToggle } from "../../hooks/use-toggle";
import { Chevron } from "./chevron";
import {
  FlexColumnContainer,
  NonGrowingFlexContainer,
  Spacer,
  VerticallyCenteredContainer,
} from "./flex";
import { Subsubheading } from "./headings";

const ExpandButton = styled.button`
  cursor: pointer;
  background-color: transparent;
  border: none;
`;

interface ICollapsibleProps {
  autoOpen?: boolean;
  children: React.ReactNode;
  title: string;
}

/**
 * A collapsible container.
 */
export const Collapsible = ({
  autoOpen = false,
  children,
  title,
}: ICollapsibleProps) => {
  const [isOpen, toggleIsOpen] = useToggle(autoOpen);
  const handleOpen = useCallback(() => toggleIsOpen(), []);

  return (
    <FlexColumnContainer>
      <VerticallyCenteredContainer>
        <NonGrowingFlexContainer>
          <Subsubheading text={title} />
        </NonGrowingFlexContainer>
        <NonGrowingFlexContainer>
          <ExpandButton onClick={handleOpen}>
            <Chevron rotation={isOpen ? 0 : -90} />
          </ExpandButton>
        </NonGrowingFlexContainer>
      </VerticallyCenteredContainer>

      {isOpen && (
        <FlexColumnContainer>
          {children}
          <Spacer />
        </FlexColumnContainer>
      )}
    </FlexColumnContainer>
  );
};
