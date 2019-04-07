import * as React from "react";
import styled from "styled-components";
import { transitionDuration } from "../config";
import { IThemeProps } from "../theme";

const Container = styled.div`
  position: relative;
  margin: 1rem 0rem;
  padding-top: 1rem;
`;

const Title = styled.label`
  position: absolute;
  display: block;

  color: currentColor;
  transition-property: top, color, font-weight, font-size;
  transition-duration: ${transitionDuration};
`;

const Field = styled.input`
  width: 100%;
  padding: 0.75rem 0rem;

  font-size: 14px;

  border: none;
  border-bottom: 1.5px solid #aaa;

  transition-property: border-color;
  transition-duration: ${transitionDuration};

  &::placeholder {
    transition-property: color;
    transition-duration: ${transitionDuration};
  }

  &[value=""] {
    &::placeholder {
      color: white;
    }

    & + ${Title} {
      top: 2rem;
      font-size: 0.9rem;
      font-weight: normal;
      pointer-events: none;
    }
  }

  &:focus,
  &:not([value=""]) {
    &::placeholder {
      color: #ccc;
    }

    & + ${Title} {
      top: 0rem;
      font-size: 0.7rem;
      font-weight: bold;
    }
  }

  &:focus {
    border-color: ${(props: IThemeProps) => props.theme.colorGradientEnd};

    & + ${Title} {
      color: ${(props: IThemeProps) => props.theme.colorGradientEnd};
    }
  }
`;

interface ITextInputProps {
  value: string;
  onChange: (value: string) => any;
  placeholder: string;
  password?: boolean;
  title?: string;
  focus?: boolean;
}

/**
 * An input.
 */
export const TextInput = ({ value, onChange, title, placeholder, password, focus }: ITextInputProps) => {
  return (
    <Container>
      <Field
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type={password ? "password" : "text"}
        autoFocus={focus}
      />
      {title && (
        <Title>{title}</Title>
      )}
    </Container>
  );
};
