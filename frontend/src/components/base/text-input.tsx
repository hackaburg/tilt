import { css } from "@emotion/core";
import styled from "@emotion/styled";
import * as React from "react";
import { useCallback } from "react";
import { useFocus } from "../../hooks/use-focus";
import { FormField } from "./form-field";
import { TextField } from "@mui/material";

const FieldStyle = css`
  width: 100%;
  padding: 0.75rem 0.5rem;
  font-size: 14px;
  border: none;
`;

const Area = styled.textarea`
  ${FieldStyle}
  resize: vertical;
`;

const Input = styled.input`
  ${FieldStyle}
`;

/**
 * The type of the text input.
 */
export enum TextInputType {
  Text = "text",
  Password = "password",
  Area = "area",
  Number = "number",
  Email = "email",
}

interface ITextInputProps<TValue = any> {
  placeholder?: string;
  autoFocus?: boolean;
  title: string;
  mandatory?: boolean;
  type?: TextInputType;
  value: TValue;
  onChange: (value: TValue) => unknown;
  min?: number;
  max?: number;
  maxLength?: number;
  allowDecimals?: boolean;
  isDisabled?: boolean;
  name?: string;
  autoCompleteField?: string;
  rows?: number;
  description?: string;
}

/**
 * An input, that can also be a textarea, depending on its `type`.
 */
export const TextInput = ({
  value,
  onChange,
  title,
  placeholder,
  type = TextInputType.Text,
  autoFocus = false,
  mandatory,
  min,
  max,
  maxLength = 1024,
  allowDecimals,
  isDisabled = false,
  name,
  autoCompleteField,
  description,
  rows,
}: ITextInputProps) => {
  const [isFocused, onFocus, onBlur] = useFocus(autoFocus);
  const fieldType = type || TextInputType.Text;
  const fieldProps = {
    name,
    autoFocus,
    disabled: isDisabled,
    onBlur,
    onFocus,
    placeholder,
    value,

    onChange: useCallback(
      (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const changedValue = event.target.value.substr(0, maxLength);

        if (type === TextInputType.Number) {
          const parsedValue = Number(changedValue);
          onChange(parsedValue);
          return;
        }

        onChange(changedValue);
      },
      [onChange, type],
    ),
  };

  const field =
    fieldType === TextInputType.Area ? (
      <Area {...fieldProps} rows={rows} />
    ) : (
      <div>
        <TextField
          style={{ marginTop: "0.5rem" }}
          type={fieldType}
          id="outlined-basic"
          variant="outlined"
          label={description}
          fullWidth
          {...fieldProps}
        />
      </div>
    );

  return (
    <FormField title={title} mandatory={mandatory}>
      {field}
    </FormField>
  );
};
