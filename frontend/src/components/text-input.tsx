import { css } from "@emotion/core";
import styled from "@emotion/styled";
import * as React from "react";
import { useCallback } from "react";
import { useFocus } from "../hooks/use-focus";
import {
  FormField,
  getPlaceholderStyle,
  IPlaceholderAwareProps,
} from "./form-field";

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

interface ICommonTextInputProps {
  placeholder?: string;
  focus?: boolean;
  title?: string;
  mandatory?: boolean;
  type?: TextInputType;
  onChange: (value: any) => any;
  min?: number;
  max?: number;
  allowDecimals?: boolean;
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
  type,
  focus,
  mandatory,
  min,
  max,
  allowDecimals,
}: ITextInputProps) => {
  const [isFocused, onFocus, onBlur] = useFocus();
  const isEmpty = `${value}`.trim().length === 0;
  const fieldType = type || TextInputType.Text;
  const fieldProps = {
    active: isFocused,
    autoFocus: focus,
    empty: isEmpty,

    onChange: useCallback(
      (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const changedValue = event.target.value;

        if (type === TextInputType.Number) {
          const parsedValue = Number(changedValue);
          onChange(parsedValue);
          return;
        }

        onChange(changedValue);
      },
      [onChange, type],
    ),
    placeholder,
    value,

    onBlur,
    onFocus,
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
