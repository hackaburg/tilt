import * as React from "react";
import { NavLink } from "react-router-dom";
import styled from "styled-components";
import { transitionDuration } from "../config";

/**
 * The sidebar menu.
 */
export const SidebarMenu = styled.ul`
  display: block;
  margin: 0;
  padding: 0;
  list-style: none;
`;

const Item = styled.li`
  display: block;
`;

const Link = styled(NavLink)`
  display: block;
  padding: 1rem;

  transition-property: background-color;
  transition-duration: ${transitionDuration};

  color: white;
  text-decoration: none;

  &.active {
    background-color: rgba(0, 0, 0, 0.3);
  }

  &:hover {
    background-color: rgba(0, 0, 0, 0.4);
  }
`;

interface ISidebarMenuItemProps {
  to: string;
  onClick?: () => any;
  children: string;
}

/**
 * An item in the sidebar.
 */
export const SidebarMenuItem = ({ to, onClick, children }: ISidebarMenuItemProps) => (
  <Item>
    <Link to={to} exact onClick={onClick}>
      {children}
    </Link>
  </Item>
);
