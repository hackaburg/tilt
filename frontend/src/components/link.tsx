import styled, { css } from "styled-components";
import { IThemeProps } from "../theme";

const LinkStyle = css`
  cursor: pointer;
  color: ${(props: IThemeProps) => props.theme.colorLink};
  text-decoration: none;

  &:hover,
  &:focus,
  &:active {
    color: ${(props: IThemeProps) => props.theme.colorLinkHover};
  }
`;

/**
 * A span that looks like a link, but isn't.
 */
export const LinkLike = styled.span`
  ${LinkStyle}
`;
