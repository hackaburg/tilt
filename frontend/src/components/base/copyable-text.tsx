import styled from "@emotion/styled";
import * as React from "react";
import { useCallback, useRef } from "react";
import { useNotificationContext } from "../../contexts/notification-context";
import { Nullable } from "../../util";
import { Button } from "./button";
import { Elevated } from "./elevated";
import { FlexColumnContainer } from "./flex";

const ScrollableText = styled.textarea`
  resize: none;
  padding: 1rem;
  font-family: Monaco, Consolas, Inconsolata, monospace;
  font-size: inherit;
  border: none;
  height: 200px;
`;

const ignoreChange = () => 0;

interface ICopyableTextProps {
  text: string;
}

/**
 * A textfield with a button to allow easy copy and paste.
 */
export const CopyableText = ({ text }: ICopyableTextProps) => {
  const { showNotification } = useNotificationContext();
  const ref = useRef<Nullable<HTMLTextAreaElement>>(null);

  const handleCopy = useCallback(() => {
    const { current: area } = ref;

    if (area == null) {
      return;
    }

    area.select();
    area.setSelectionRange(0, text.length);
    document.execCommand("copy");
    area.setSelectionRange(0, 0);

    showNotification("Copied");
  }, [showNotification, text]);

  return (
    <FlexColumnContainer>
      <Elevated level={1}>
        <ScrollableText
          ref={ref}
          value={text}
          onChange={ignoreChange}
          disabled
        />
      </Elevated>

      <div style={{ marginTop: "2rem" }}>
        <Button onClick={handleCopy} primary>
          Copy to clipboard
        </Button>
      </div>
    </FlexColumnContainer>
  );
};
