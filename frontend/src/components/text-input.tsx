import * as React from "react";
import { useState } from "react";
import styled, { css } from "styled-components";
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
}

interface ICommonInputProps {
  onChange: (value: string) => any;
  placeholder: string;
  type?: TextInputType;
  title?: React.ReactChild;
  focus?: boolean;
}

interface ITextInputProps extends ICommonInputProps {
  value: string;
}

/**
 * An input, that can also be a textarea, depending on its `type`.
 */
export const TextInput = ({ value, onChange, title, placeholder, type, focus }: ITextInputProps) => {
  const [isFocused, setIsFocused] = useState(!!focus);
  const isEmpty = !value;
  const fieldType = type || TextInputType.Text;
  const fieldProps = {
    active: isFocused,
    autoFocus: focus,
    empty: isEmpty,

    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(event.target.value),
    placeholder,
    value,

    onBlur: () => setIsFocused(false),
    onFocus: () => setIsFocused(true),
  };

  const field =
    fieldType === TextInputType.Area
      ? (
        <Area {...fieldProps} />
      )
      : (
        <Input
          type={type}
          {...fieldProps}
        />
      );

  return (
    <FormField
      active={isFocused}
      empty={isEmpty}
      title={title}
    >
      {field}
    </FormField>
  );
};

interface IStatefulTextInputProps extends ICommonInputProps {
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
