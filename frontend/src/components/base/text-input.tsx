import { css } from "@emotion/core";
import styled from "@emotion/styled";
import * as React from "react";
import { useCallback } from "react";
import { useFocus } from "../../hooks/use-focus";
import { Elevated } from "./elevated";
import { FormField } from "./form-field";

const FieldStyle = css`
  width: 100%;
  padding: 0.75rem 1rem;
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
}

interface ICommonTextInputProps {
  placeholder?: string;
  autoFocus?: boolean;
  title: string;
  mandatory?: boolean;
  type?: TextInputType;
  onChange: (value: any) => any;
  min?: number;
  max?: number;
  allowDecimals?: boolean;
  isDisabled?: boolean;
}

interface ITextInputProps extends ICommonTextInputProps {
  value: any;
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
  allowDecimals,
  isDisabled = false,
}: ITextInputProps) => {
  const [isFocused, onFocus, onBlur] = useFocus(autoFocus);
  const fieldType = type || TextInputType.Text;
  const fieldProps = {
    autoFocus,
    disabled: isDisabled,
    onBlur,
    onFocus,
    placeholder,
    value,

    onChange: useCallback(
      (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const changedValue = event.target.value.substr(0, 1024);

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
      <Area {...fieldProps} />
    ) : (
      <Input
        type={fieldType}
        min={min}
        max={max}
        step={allowDecimals ? "any" : 1}
        spellCheck={false}
        {...fieldProps}
      />
    );

  const elevationLevel = isFocused ? 2 : 1;

  return (
    <FormField title={title} mandatory={mandatory}>
      <Elevated level={elevationLevel}>{field}</Elevated>
    </FormField>
  );
};
