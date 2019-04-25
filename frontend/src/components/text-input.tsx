import * as React from "react";
import { useState } from "react";
import styled from "styled-components";
import { FormField, getPlaceholderStyle, IPlaceholderAwareProps } from "./form-field";

const Field = styled.input<IPlaceholderAwareProps>`
  width: 100%;
  padding: 0.75rem 0rem;

  font-size: 14px;
  border: none;

  ${({ empty, active }) => getPlaceholderStyle(empty, active)}
`;

interface ICommonInputProps {
  onChange: (value: string) => any;
  placeholder: string;
  password?: boolean;
  title?: React.ReactChild;
  focus?: boolean;
}

interface ITextInputProps extends ICommonInputProps {
  value: string;
}

/**
 * An input.
 */
export const TextInput = ({ value, onChange, title, placeholder, password, focus }: ITextInputProps) => {
  const [isFocused, setIsFocused] = useState(!!focus);
  const isEmpty = !value;

  return (
    <FormField
      active={isFocused}
      empty={isEmpty}
      title={title}
    >
      <Field
        empty={isEmpty}
        active={isFocused}

        value={value}
        onChange={(event) => onChange(event.target.value)}

        placeholder={placeholder}
        type={password ? "password" : "text"}

        autoFocus={focus}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
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
