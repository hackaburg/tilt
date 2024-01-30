import styled from "@emotion/styled";
import * as React from "react";
import { NavLink } from "react-router-dom";
import { transitionDuration } from "../../../config";

const UL = styled.ul`
  display: block;
  margin: 0;
  padding: 0;
  list-style: none;
  padding-left: 0.5rem;
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
  font-size: 1.2rem;

  transition-property: background-color;
  transition-duration: ${transitionDuration};

  color: #929292;
  text-decoration: none;

  &.active {
    color: white;
  }

  &:hover {
    color: white;
  }
`;

interface ISidebarMenuItemProps {
  to?: string;
  onClick?: () => any;
  children: any;
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
