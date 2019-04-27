import * as React from "react";
import { useState } from "react";
import styled, { css } from "styled-components";
import { useFocus } from "../hooks/use-focus";
import { FormField, getPlaceholderStyle, IPlaceholderAwareProps } from "./form-field";

const FieldStyle = css`
  width: 100%;
  padding: 0.5rem 0rem 0.25rem 0rem;

  font-size: 14px;
  border: none;
`;

const Area = styled.textarea<IPlaceholderAwareProps>`
  ${FieldStyle}
  resize: vertical;

  ${({ empty, active }) => getPlaceholderStyle(empty, active)}
`;

const Input = styled.input<IPlaceholderAwareProps>`
  ${FieldStyle}

  ${({ empty, active }) => getPlaceholderStyle(empty, active)}
`;

/**
 * The type of the text input.
 */
export enum TextInputType {
  Text = "text",
  Password = "password",
  Area = "area",
  Number = "number",
}

interface ITextInputProps {
  placeholder?: string;
  focus?: boolean;
  title?: string;
  mandatory?: boolean;
  type?: TextInputType;
  value: any;
  onChange: (value: any) => any;
  min?: number;
  max?: number;
  allowDecimals?: boolean;
}

/**
 * An input, that can also be a textarea, depending on its `type`.
 */
export const TextInput = ({ value, onChange, title, placeholder, type, focus, mandatory, min, max, allowDecimals }: ITextInputProps) => {
  const [isFocused, onFocus, onBlur] = useFocus();
  const isEmpty = !value;
  const fieldType = type || TextInputType.Text;
  const fieldProps = {
    active: isFocused,
    autoFocus: focus,
    empty: isEmpty,

    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const changedValue = event.target.value;

      if (type === TextInputType.Number) {
        const parsedValue = Number(changedValue);
        onChange(parsedValue);
        return;
      }

      onChange(changedValue);
    },
    placeholder,
    value,

    onBlur,
    onFocus,
  };

  const field =
    fieldType === TextInputType.Area
      ? (
        <Area {...fieldProps} />
      )
      : (
        <Input
          type={fieldType}
          min={min}
          max={max}
          step={allowDecimals ? "any" : 1}
          {...fieldProps}
        />
      );

  return (
    <FormField
      active={isFocused}
      empty={isEmpty}
      title={title}
      mandatory={mandatory}
    >
      {field}
    </FormField>
  );
};

interface IStatefulTextInputProps {
  onChange: (value: string) => any;
  placeholder: string;
  type?: TextInputType;
  focus?: boolean;
  title?: string;
  mandatory?: boolean;
  initialValue: string;
}

/**
 * An input, which contains state inside, i.e. can be used to use hooks "conditionally".
 * Due to state being inside the component, you can render it conditionally, making the state hook conditonal as well.
 */
export const StatefulTextInput = ({ initialValue, onChange, ...props }: IStatefulTextInputProps) => {
  const [text, setText] = useState(initialValue);
  const handleChange = (value: string) => {
    setText(value);
    onChange(value);
  };

  return (
    <TextInput
      value={text}
      onChange={handleChange}
      {...props}
    />
  );
};
