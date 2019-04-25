import * as React from "react";
import styled, { css } from "styled-components";
import { transitionDuration } from "../config";
import { IThemeProps } from "../theme";

interface IContainerProps {
  active: boolean;
}

const Container = styled.div<IContainerProps>`
  position: relative;
  margin: 1rem 0rem;
  padding-top: 1rem;

  border-bottom: 1.5px solid #aaa;
  transition-property: border-color;
  transition-duration: ${transitionDuration};

  ${({ active, theme }: IContainerProps & IThemeProps) => active && `
    border-color: ${theme.colorGradientEnd};
  `}
`;

interface ITitleProps {
  active: boolean;
  moveUp: boolean;
}

const Title = styled.label<ITitleProps>`
  position: absolute;
  top: 2rem;
  display: block;

  color: currentColor;
  font-size: 0.9rem;
  font-weight: normal;
  pointer-events: none;

  transition-property: top, color, font-weight, font-size;
  transition-duration: ${transitionDuration};

  ${({ moveUp }: ITitleProps) => moveUp && `
    top: 0rem;

    font-size: 0.7rem;
    font-weight: bold;
  `}

  ${({ active, theme }) => active && `
    color: ${theme.colorGradientEnd};
  `}
`;

interface IFormFieldProps {
  active: boolean;
  empty: boolean;
  title?: string;
  children: React.ReactChild;
}

/**
 * A form field, whose label moves up when the field is active.
 */
export const FormField = ({ active, empty, title, children }: IFormFieldProps) => (
  <Container active={active}>
    {title && (
      <Title
        active={active}
        moveUp={active || !empty}
      >{title}</Title>
    )}

    {children}
  </Container>
);

/**
 * Creates the placeholder style, depending on the fields state.
 * @param empty Whether the field is empty
 * @param focused Whether the field is currently focused
 */
export const getPlaceholderStyle = (empty: boolean, focused: boolean) => css`
  &::placeholder {
    transition-property: color;
    transition-duration: ${transitionDuration};
  }

  ${empty && `
    &::placeholder {
      color: white;
    }
  `}

  ${focused && `
    &::placeholder {
      color: #ccc;
    }
  `}
`;

/**
 * Props for components, whose placeholder should change depending on the field's state.
 */
export interface IPlaceholderAwareProps {
  active: boolean;
  empty: boolean;
}
