import { Link as RouterLink } from "react-router-dom";
import styled from "styled-components";
import { IThemeProps } from "../theme";

/**
 * A styled link.
 */
export const Link = styled(RouterLink)`
  cursor: pointer;
  color: ${(props: IThemeProps) => props.theme.colorLink};
  text-decoration: none;

  &:hover,
  &:focus,
  &:active {
    color: ${(props: IThemeProps) => props.theme.colorLinkHover};
  }
`;
