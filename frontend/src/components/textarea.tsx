import * as React from "react";
import { useState } from "react";
import styled from "styled-components";
import { FormField, getPlaceholderStyle, IPlaceholderAwareProps } from "./form-field";

const Area = styled.textarea<IPlaceholderAwareProps>`
  width: 100%;
  padding: 0.75rem 0rem;

  font-size: 14px;

  border: none;
  resize: vertical;

  ${({ empty, active }) => getPlaceholderStyle(empty, active)}
`;

interface ITextAreaProps {
  value: string;
  onChange: (value: string) => any;
  placeholder: string;
  title?: string;
}

/**
 * A textarea input with a title.
 */
export const TextArea = ({ value, onChange, placeholder, title }: ITextAreaProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const isEmpty = !value;

  return (
    <FormField
      active={isFocused}
      empty={isEmpty}
      title={title}
    >
      <Area
        active={isFocused}
        empty={isEmpty}

        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}

        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
    </FormField>
  );
};
