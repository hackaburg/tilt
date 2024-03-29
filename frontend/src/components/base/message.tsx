import * as React from "react";
import { Alert, AlertColor } from "@mui/material";

interface IMessageProps {
  type?: AlertColor;
  children: React.ReactNode;
}

/**
 * A message to display some text.
 */
export const Message = ({ type, children }: IMessageProps) => {
  return (
    <Alert severity={type} color={type}>
      {children}
    </Alert>
  );
};
