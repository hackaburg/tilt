import * as React from "react";
import { ScaleLoader } from "react-spinners";
import styled from "styled-components";
import { borderRadius, transitionDuration } from "../config";
import { IThemeProps } from "../theme";

interface IStyledButtonProps {
  primary?: boolean;
  fluid?: boolean;
  loading?: boolean;
  disable?: boolean;
}

const StyledButton = styled.button<IStyledButtonProps>`
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

  transition-property: box-shadow, top, background, opacity;
  transition-duration: ${transitionDuration};

  ${(props) =>
    (props.disable || props.loading)
    ? `
      cursor: default;
      opacity: 0.7;
    `
    : `
      opacity: 1;

      &:hover {
        color: white;
        top: -3px;
        box-shadow: 0px 7px 15px rgba(0, 0, 0, 0.15);
      }
    `}

  ${(props: IThemeProps & IStyledButtonProps) => props.primary && props.theme.colorGradientStart && `
    background: linear-gradient(to right, ${props.theme.colorGradientStart}, ${props.theme.colorGradientEnd});
  `}
`;

const Text = styled.span`
  display: inline-block;
`;

interface IButtonProps extends IStyledButtonProps {
  children?: string;
  onClick?: (event: React.MouseEvent) => any;
}

/**
 * A clickable button.
 */
export const Button = (props: IButtonProps) => (
  <StyledButton
    primary={props.primary}
    fluid={props.fluid}
    loading={props.loading}
    disable={props.disable}
    onClick={(event) => (!props.loading && !props.disable) && props.onClick && props.onClick(event)}
  >
    <Text>{props.children}</Text>
    {props.loading && (
      <ScaleLoader
        height={1}
        heightUnit="rem"
        color="currentColor"
        css={{
          position: "absolute",
          right: "1rem",
          top: "0.5rem",
        } as any}
      />
    )}
  </StyledButton>
);
