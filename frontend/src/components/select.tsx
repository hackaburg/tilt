import styled from "@emotion/styled";
import * as React from "react";
import { useCallback } from "react";
import { Elevated } from "./elevated";
import { FormField } from "./form-field";

const SelectContainer = styled(Elevated)`
  padding: 0.75rem 1rem;
`;

const Field = styled.select`
  width: 100%;
  -webkit-appearance: none;
  background-color: transparent;
  border: none;
  font-size: 14px;
`;

interface ISelectProps {
  values: string[];
  value: string;
  onChange: (value: string) => any;
  placeholder?: string;
  title: string;
  mandatory?: boolean;
}

/**
 * A select dropdown.
 */
export const Select = ({
  values,
  value,
  onChange,
  title,
  placeholder,
  mandatory,
}: ISelectProps) => {
  const options = values.map((optionValue) => (
    <option key={optionValue} value={optionValue}>
      {optionValue}
    </option>
  ));

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) =>
      onChange(event.target.value),
    [onChange],
  );

  return (
    <FormField title={title} mandatory={mandatory}>
      <SelectContainer level={1}>
        <Field value={value} onChange={handleChange}>
          {placeholder && <option>{placeholder}</option>}

          {options}
        </Field>
      </SelectContainer>
    </FormField>
  );
};
