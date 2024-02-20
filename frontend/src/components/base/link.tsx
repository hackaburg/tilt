import { css } from "@emotion/core";
import styled from "@emotion/styled";
import * as React from "react";
import { Link as RouterLink } from "react-router-dom";
import { Routes } from "../../routes";
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

interface IInternalLinkProps {
  to: Routes;
  children: any;
}

const InternalRouterLink = styled(RouterLink)`
  ${linkStyle}
`;

/**
 * An internal styled link.
 */
export const InternalLink = ({ to, children }: IInternalLinkProps) => (
  <InternalRouterLink to={to}>{children}</InternalRouterLink>
);

const A = styled.a`
  ${linkStyle}
`;

interface IExternalLinkProps {
  to: string;
  children: any;
}

/**
 * An external styled link.
 */
export const ExternalLink = ({ to, children }: IExternalLinkProps) => (
  <A href={to} target="_blank">
    {children}
  </A>
);
