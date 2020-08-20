import styled from "@emotion/styled";
import * as React from "react";
import { NavLink } from "react-router-dom";
import { transitionDuration } from "../../../config";

const UL = styled.ul`
  display: block;
  margin: 0;
  padding: 0;
  list-style: none;
`;

interface ISidebarMenuProps {
  children: React.ReactNode;
}

/**
 * The sidebar menu.
 */
export const SidebarMenu = ({ children }: ISidebarMenuProps) => (
  <UL>{children}</UL>
);

const LI = styled.li`
  display: block;
`;

const Link = styled(NavLink)`
  display: block;
  padding: 1rem 1.5rem;

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
export const SidebarMenuItem = ({
  to,
  onClick,
  children,
}: ISidebarMenuItemProps) => (
  <LI>
    <Link to={to} exact onClick={onClick}>
      {children}
    </Link>
  </LI>
);
