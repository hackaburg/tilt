import styled from "@emotion/styled";
import * as React from "react";
import { borderRadius } from "../../../config";
import { variables } from "../../../theme";
import { Elevated } from "../../base/elevated";
import { StyleableFlexContainer } from "../../base/flex";

const Bar = styled(StyleableFlexContainer)`
  height: 3px;
  border-radius: ${borderRadius};
  background-color: ${variables.colorGradientEnd};
`;

const Spacer = styled(StyleableFlexContainer)`
  height: 0.25rem;
`;

const Button = styled.button`
  display: block;
  width: 3rem;
  padding: 0.5rem;

  background-color: transparent;
  border: none;
  cursor: pointer;
`;

interface ISidebarBurgerProps {
  onClick: () => any;
}

/**
 * A button that kinda looks like a burger, because it consists of 3 bars.
 */
export const SidebarToggle = ({ onClick }: ISidebarBurgerProps) => (
  <Elevated level={1}>
    <Button onClick={onClick}>
      <Bar />
      <Spacer />
      <Bar />
      <Spacer />
      <Bar />
    </Button>
  </Elevated>
);
