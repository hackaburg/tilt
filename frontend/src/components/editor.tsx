import * as React from "react";
import MonacoEditor from "react-monaco-editor";

interface IEditorProps {
  language: string;
  value: string;
  onChange: (value: string) => any;
}

/**
 * A more or less rich text editor to edit text.
 */
export const Editor = ({ language, value, onChange }: IEditorProps) => (
  <MonacoEditor
    language={language}
    value={value}
    onChange={(text) => onChange(text)}
    width="100%"
    height="40vh"
    options={{
      autoClosingBrackets: "always",
      colorDecorators: true,
      minimap: {
        enabled: false,
      },
    }}
  />
);
