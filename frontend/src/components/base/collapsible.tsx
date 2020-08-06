import styled from "@emotion/styled";
import * as React from "react";
import { useCallback } from "react";
import FlexView from "react-flexview";
import { useToggle } from "../../hooks/use-toggle";
import { Chevron } from "./chevron";
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
    <FlexView column shrink={false}>
      <ClickableSubheading onClick={handleOpen}>
        {title} <Chevron rotation={isOpen ? 0 : -90} />
      </ClickableSubheading>

      {isOpen && (
        <FlexView column grow>
          {children as FlexView.Props["children"]}
        </FlexView>
      )}
    </FlexView>
  );
};
