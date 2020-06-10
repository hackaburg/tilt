import styled from "@emotion/styled";
import * as React from "react";
import { borderRadius } from "../config";
import { variables } from "../theme";

const Bar = styled.div`
  height: 3px;
  border-radius: ${borderRadius};
  background-color: ${variables.colorGradientEnd};

  margin-top: 0.25rem;

  :first-of-type {
    margin-top: 0;
  }
`;

const Button = styled.button`
  display: block;
  width: 3rem;
  padding: 0.5rem;

  background-color: white;
  border: none;
  cursor: pointer;
`;

interface ISidebarBurgerProps {
  onClick: () => any;
}

/**
 * A button that kinda looks like a burger, because it consists of 3 bars.
 */
export const SidebarBurger = ({ onClick }: ISidebarBurgerProps) => (
  <Button onClick={onClick}>
    <Bar />
    <Bar />
    <Bar />
  </Button>
);
