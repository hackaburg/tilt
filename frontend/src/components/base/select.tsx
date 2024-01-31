import * as React from "react";
import { useCallback } from "react";
import { FormField } from "./form-field";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material";

interface ISelectProps {
  values: string[];
  value: string;
  onChange: (value: string) => any;
  placeholder?: string;
  title: string;
  mandatory?: boolean;
  isDisabled?: boolean;
  description?: string;
}

/**
 * A select dropdown.
 */
export const SelectWrapper = ({
  values,
  value,
  onChange,
  title,
  placeholder,
  mandatory,
  isDisabled = false,
  description,
}: ISelectProps) => {
  const options = values.map((optionValue) => (
    <MenuItem key={optionValue} value={optionValue}>
      {optionValue}
    </MenuItem>
  ));

  const handleChange = useCallback(
    (event: SelectChangeEvent) => onChange(event.target.value),
    [onChange],
  );

  return (
    <div>
      <FormField title={title} mandatory={mandatory}>
        <FormControl fullWidth style={{ marginTop: "0.5rem" }}>
          <InputLabel id="demo-simple-select-label">{description}</InputLabel>
          <Select
            value={value}
            label={description}
            onChange={handleChange}
            disabled={isDisabled}
          >
            {placeholder && <MenuItem>{placeholder}</MenuItem>}

            {options}
          </Select>
        </FormControl>
      </FormField>
    </div>
  );
};
