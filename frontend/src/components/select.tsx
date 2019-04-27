import * as React from "react";
import { useState } from "react";
import styled from "styled-components";
import { transitionDuration } from "../config";
import { FormField, IPlaceholderAwareProps } from "./form-field";

const Field = styled.select<IPlaceholderAwareProps>`
  width: 100%;
  padding: 0.5rem 0rem 0.25rem 0rem;

  -webkit-appearance: none;
  background-color: transparent;
  border: none;
  font-size: 14px;

  opacity: 1;
  transition-property: opacity;
  transition-duration: ${transitionDuration};

  ${({ empty }) => empty && `
    opacity: 0;
  `}
`;

interface ISelectProps {
  values: string[];
  value: string;
  onChange: (value: string) => any;
  title?: React.ReactChild;
  placeholder?: string;
}

/**
 * A select dropdown.
 */
export const Select = ({ values, value, onChange, title, placeholder }: ISelectProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const isEmpty = !value || value === placeholder;
  const options = values.map((optionValue) => (
    <option key={optionValue} value={optionValue}>{optionValue}</option>
  ));

  return (
    <FormField
      active={isFocused && !isEmpty}
      empty={isEmpty}
      title={title}
    >
      <Field
        active={isFocused}
        empty={isEmpty}

        value={value}
        onChange={(event) => onChange(event.target.value)}

        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      >
        {placeholder && (
          <option>{placeholder}</option>
        )}

        {options}
      </Field>
    </FormField>
  );
};
