import styled from "@emotion/styled";
import * as React from "react";
import { useCallback } from "react";
import { useToggle } from "../../hooks/use-toggle";
import { Chevron } from "./chevron";
import {
  FlexColumnContainer,
  StyleableFlexContainer,
  VerticallyCenteredContainer,
} from "./flex";
import { Subheading } from "./headings";

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
        <StyleableFlexContainer>
          <Subheading text={title} />
        </StyleableFlexContainer>
        <StyleableFlexContainer>
          <ExpandButton onClick={handleOpen}>
            <Chevron rotation={isOpen ? 0 : -90} />
          </ExpandButton>
        </StyleableFlexContainer>
      </VerticallyCenteredContainer>

      {isOpen && <FlexColumnContainer>{children}</FlexColumnContainer>}
    </FlexColumnContainer>
  );
};
