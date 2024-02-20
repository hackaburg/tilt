import * as React from "react";
import { useCallback } from "react";
import { useFocus } from "../../hooks/use-focus";
import { FormField } from "./form-field";
import { TextField } from "@mui/material";

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
  maxLength = 1024,
  isDisabled = false,
  name,
  description,
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

  const field = (
    <div>
      <TextField
        style={{ marginTop: "0.5rem" }}
        type={fieldType}
        id="outlined-basic"
        variant="outlined"
        label={description}
        fullWidth
        focused={isFocused}
        {...fieldProps}
        multiline={type === TextInputType.Area}
      />
    </div>
  );

  return (
    <FormField title={title} mandatory={mandatory}>
      {field}
    </FormField>
  );
};
