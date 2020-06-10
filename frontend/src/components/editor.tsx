import * as React from "react";
import { useCallback } from "react";

interface IEditorProps {
  language: string;
  value: string;
  onChange: (value: string) => any;
}

/**
 * A more or less rich text editor to edit text.
 */
export const Editor = ({ value, onChange }: IEditorProps) => {
  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(event.target.value);
    },
    [onChange],
  );

  return <textarea onChange={handleChange} value={value} />;
};
