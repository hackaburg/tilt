import styled from "@emotion/styled";
import { Link as RouterLink } from "react-router-dom";
import { variables } from "../theme";

/**
 * A styled link.
 */
export const Link = styled(RouterLink)`
  cursor: pointer;
  color: ${variables.colorLink};
  text-decoration: none;

  &:hover,
  &:focus,
  &:active {
    color: ${variables.colorLinkHover};
  }
`;
