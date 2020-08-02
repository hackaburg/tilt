import styled from "@emotion/styled";
import * as React from "react";
import FlexView from "react-flexview";
import { borderRadius } from "../../../config";
import { variables } from "../../../theme";

const Bar = styled(FlexView)`
  height: 3px;
  border-radius: ${borderRadius};
  background-color: ${variables.colorGradientEnd};
`;

const Spacer = styled(FlexView)`
  height: 0.25rem;
`;

const Button = styled.button`
  display: block;
  width: 3rem;
  padding: 0.5rem;

  background-color: white;
  border: none;
  cursor: pointer;
`;

const ButtonContainer = styled(FlexView)`
  padding: 0.75rem;
`;

interface ISidebarBurgerProps {
  onClick: () => any;
}

/**
 * A button that kinda looks like a burger, because it consists of 3 bars.
 */
export const SidebarToggle = ({ onClick }: ISidebarBurgerProps) => (
  <ButtonContainer>
    <Button onClick={onClick}>
      <Bar />
      <Spacer />
      <Bar />
      <Spacer />
      <Bar />
    </Button>
  </ButtonContainer>
);
