import { css } from "@emotion/core";
import styled from "@emotion/styled";
import * as React from "react";
import { Link as RouterLink } from "react-router-dom";
import { variables } from "../../theme";

const linkStyle = css`
  cursor: pointer;
  color: ${variables.colorLink};
  text-decoration: none;

  &:hover,
  &:focus,
  &:active {
    color: ${variables.colorLinkHover};
  }
`;

interface ILinkProps {
  to: string;
  children: string;
}

const InternalRouterLink = styled(RouterLink)`
  ${linkStyle}
`;

/**
 * An internal styled link.
 */
export const InternalLink = ({ to, children }: ILinkProps) => (
  <InternalRouterLink to={to}>{children}</InternalRouterLink>
);

const A = styled.a`
  ${linkStyle}
`;

/**
 * An external styled link.
 */
export const ExternalLink = ({ to, children }: ILinkProps) => (
  <A href={to} target="_blank">
    {children}
  </A>
);
