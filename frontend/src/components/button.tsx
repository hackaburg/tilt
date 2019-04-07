import styled from "styled-components";
import { borderRadius, transitionDuration } from "../config";
import { IThemeProps } from "../theme";

interface IButtonProps {
  primary?: boolean;
  fluid?: boolean;
  loading?: boolean;
}

/**
 * A clickable button.
 */
export const Button = styled.button<IButtonProps>`
  position: relative;
  top: 0px;

  display: inline-block;
  padding: 0.75rem 2rem;
  margin: 0rem;

  ${(props) => props.fluid && `
    width: 100%;
  `}

  border: none;
  border-radius: ${borderRadius};
  box-shadow: 0px 7px 10px rgba(0, 0, 0, 0.1);

  font-size: 0.8rem;
  font-weight: bold;
  text-transform: uppercase;
  cursor: pointer;

  background: #333;
  background-color: #333;
  color: white;

  transition-property: box-shadow, top, background;
  transition-duration: ${transitionDuration};

  &:hover {
    color: white;
    top: -3px;
    box-shadow: 0px 7px 15px rgba(0, 0, 0, 0.15);
  }

  ${(props: IThemeProps & IButtonProps) => props.primary && props.theme.colorGradientStart && `
    background: linear-gradient(to right, ${props.theme.colorGradientStart}, ${props.theme.colorGradientEnd});
  `}
`;
