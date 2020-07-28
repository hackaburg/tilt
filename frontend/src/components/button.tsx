import styled from "@emotion/styled";
import * as React from "react";
import { useCallback } from "react";
import { borderRadius, transitionDuration } from "../config";
import { variables } from "../theme";

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

  ${(props) =>
    props.fluid &&
    `
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
    props.disable || props.loading
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

  ${(props: IStyledButtonProps) =>
    props.primary &&
    `
    background: linear-gradient(to top right, ${variables.colorGradientStart}, ${variables.colorGradientEnd});
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
export const Button = ({
  children,
  disable,
  fluid,
  loading,
  onClick,
  primary,
}: IButtonProps) => {
  const handleClick = useCallback(
    (event: React.MouseEvent) => {
      if (!loading && !disable && onClick != null) {
        onClick(event);
      }
    },
    [loading, disable, onClick],
  );

  return (
    <StyledButton
      primary={primary}
      fluid={fluid}
      loading={loading}
      disable={disable}
      onClick={handleClick}
    >
      <Text>{children}</Text>
      {loading && "Loading"}
    </StyledButton>
  );
};
