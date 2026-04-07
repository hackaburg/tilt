import styled from "@emotion/styled";
import * as React from "react";
import { useCallback } from "react";
import { useToggle } from "../../hooks/use-toggle";
import { Chevron } from "./chevron";
import {
  FlexColumnContainer,
  Spacer,
  VerticallyCenteredContainer,
} from "./flex";

const ExpandButton = styled.button`
  cursor: pointer;
  background-color: transparent;
  border: none;
  padding: 0;
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
        <ExpandButton onClick={handleOpen}>
          <span style={{ fontSize: "1.25rem", marginRight: "10px" }}>
            {title}
          </span>
          <Chevron
            rotation={isOpen ? 0 : -90}
            style={{ verticalAlign: "center" }}
          />
        </ExpandButton>
      </VerticallyCenteredContainer>

      {isOpen && (
        <FlexColumnContainer style={{ paddingTop: "5px" }}>
          {children}
          <Spacer />
        </FlexColumnContainer>
      )}
    </FlexColumnContainer>
  );
};
