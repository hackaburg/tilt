import styled from "@emotion/styled";
import * as React from "react";
import { useCallback } from "react";
import { borderRadius, transitionDuration } from "../../config";
import { variables } from "../../theme";
import { Spinner } from "./spinner";

const RegularButton = styled.button`
  position: relative;

  display: inline-block;
  padding: 0.75rem 2rem;
  width: 100%;

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
    props.disabled
      ? `
        cursor: default;
        opacity: 0.7;
      `
      : `
        opacity: 1;

        &:hover {
          color: white;
          box-shadow: 0px 7px 15px rgba(0, 0, 0, 0.15);
        }
    `}
`;

const PrimaryButton = styled(RegularButton)`
  background: linear-gradient(
    to top right,
    ${variables.colorGradientStart},
    ${variables.colorGradientEnd}
  );
`;

const SpinnerContainer = styled.div`
  position: absolute;
  right: 5px;
  top: 50%;
  transform: translateY(-50%);
`;

interface IButtonProps {
  children?: string;
  onClick?: (event: React.MouseEvent) => any;
  disable?: boolean;
  primary?: boolean;
  loading?: boolean;
}

/**
 * A clickable button.
 */
export const Button = ({
  children,
  onClick,
  disable = false,
  primary = false,
  loading = false,
}: IButtonProps) => {
  const handleClick = useCallback(
    (event: React.MouseEvent) => {
      if (!loading && !disable && onClick != null) {
        onClick(event);
      }
    },
    [loading, disable, onClick],
  );

  const Component = primary ? PrimaryButton : RegularButton;

  return (
    <Component disabled={disable || loading} onClick={handleClick}>
      {children}
      {loading && (
        <SpinnerContainer>
          <Spinner color={primary ? "black" : "white"} size={20} width={0.15} />
        </SpinnerContainer>
      )}
    </Component>
  );
};
