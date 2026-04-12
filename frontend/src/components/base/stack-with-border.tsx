import * as React from "react";
import { Stack, Tooltip } from "@mui/material";

interface StackWithBorderProps {
  text?: string;
  tooltip?: string;
  children?: React.ReactNode;
}

/**
 * I typically use this to display some text and a few buttons,
 * with multiple of this on top of each other, like a table.
 * Maybe these components should use tables instead, idk. It looks nice.
 */
export const StackWithBorder = ({ text, children, tooltip }: StackWithBorderProps) => {
  return (
    <div
      style={{
        border: "1px solid grey",
        borderRadius: "5px",
        padding: "10px",
        margin: "1rem auto",
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1}
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent="center"
      >
        {text && (
          <div style={{ flex: 1, textAlign: "center" }}>
            <Tooltip title={tooltip}>
              <span style={{ fontSize: "1rem" }}>{text}</span>
            </Tooltip>
          </div>
        )}
        {children}
      </Stack>
    </div>
  );
};
