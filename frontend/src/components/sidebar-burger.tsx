import * as React from "react";
import styled from "styled-components";
import { borderRadius } from "../config";
import { IThemeProps } from "../theme";

const Bar = styled.div`
  height: 3px;
  border-radius: ${borderRadius};

  ${(props: IThemeProps) => `
    background-color: ${props.theme.colorGradientEnd};
  `}

  & + & {
    margin-top: 0.25rem;
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
