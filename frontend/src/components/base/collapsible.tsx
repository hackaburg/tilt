import styled from "@emotion/styled";
import * as React from "react";
import { useCallback } from "react";
import { useToggle } from "../../hooks/use-toggle";
import { Chevron } from "./chevron";
import { FlexColumnContainer } from "./flex";
import { Subheading } from "./headings";

const ClickableSubheading = styled(Subheading)`
  cursor: pointer;
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
      <ClickableSubheading onClick={handleOpen}>
        {title} <Chevron rotation={isOpen ? 0 : -90} />
      </ClickableSubheading>

      {isOpen && <FlexColumnContainer>{children}</FlexColumnContainer>}
    </FlexColumnContainer>
  );
};
