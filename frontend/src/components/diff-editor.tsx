import * as React from "react";
import { MonacoDiffEditor } from "react-monaco-editor";

interface IDiffEditorProps {
  language: string;
  left: string;
  right: string;
}

/**
 * A readonly editor to display differences in text.
 */
export const DiffEditor = ({ language, left, right }: IDiffEditorProps) => (
  <MonacoDiffEditor
    width="100%"
    height="40vh"
    language={language}
    original={left}
    value={right}
    options={{
      readOnly: true,
    }}
  />
);
