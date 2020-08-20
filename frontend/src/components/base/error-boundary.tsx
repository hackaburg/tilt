import styled from "@emotion/styled";
import * as React from "react";
import { useCallback, useRef } from "react";
import { useNotificationContext } from "../../contexts/notification-context";
import { Nullable } from "../../state";
import { Button } from "./button";
import { Elevated } from "./elevated";
import {
  CenteredContainer,
  PageSizedContainer,
  StyleableFlexContainer,
} from "./flex";
import { Heading } from "./headings";
import { ExternalLink } from "./link";
import { Text } from "./text";

const ErrorCode = styled.textarea`
  resize: none;
  padding: 1rem;
  font-family: Monaco, Consolas, Inconsolata, monospace;
  font-size: inherit;
  border: none;
  height: 200px;
`;

const ErrorContainer = styled(StyleableFlexContainer)`
  width: 320px;
`;

const ignoreChange = () => 0;

interface IRenderError {
  exception: Error;
  info: React.ErrorInfo;
}

const RenderError = ({ exception, info }: IRenderError) => {
  const { showNotification } = useNotificationContext();
  const message = `${exception.name}: ${exception.message}\n${exception.stack}\n\nComponent stack:${info.componentStack}`;
  const ref = useRef<Nullable<HTMLTextAreaElement>>(null);

  const handleCopy = useCallback(() => {
    const { current: area } = ref;

    if (area == null) {
      return;
    }

    area.select();
    area.setSelectionRange(0, message.length);
    document.execCommand("copy");
    area.setSelectionRange(0, 0);

    showNotification("Copied");
  }, [showNotification]);

  return (
    <PageSizedContainer>
      <CenteredContainer>
        <ErrorContainer>
          <Heading text="Uh-oh, everything is on fire 🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥" />

          <Text>
            While this shouldn't have happened in the first place, we'd be happy
            if you report this error on our{" "}
            <ExternalLink to="https://github.com/hackaburg/tilt/issues/new">
              issue tracker
            </ExternalLink>
            .
          </Text>

          <Text>
            You can include this error log along a quick description to
            reproduce this issue:
          </Text>

          <Elevated level={1}>
            <ErrorCode
              ref={ref}
              value={message}
              onChange={ignoreChange}
              disabled
            />
          </Elevated>

          <Button onClick={handleCopy} primary>
            Copy to clipboard
          </Button>
        </ErrorContainer>
      </CenteredContainer>
    </PageSizedContainer>
  );
};

interface IState {
  error: Nullable<IRenderError>;
}

interface IProps {
  children: React.ReactNode;
}

export class ErrorBoundary extends React.Component<IProps, IState> {
  public state: IState = {
    error: null,
  };

  /**
   * @inheritdoc
   */
  public componentDidCatch(exception: Error, info: React.ErrorInfo) {
    this.setState({
      error: {
        exception,
        info,
      },
    });
  }

  /**
   * @inheritdoc
   */
  public render() {
    const { error } = this.state;

    if (error != null) {
      const { exception, info } = error;
      return <RenderError exception={exception} info={info} />;
    }

    return this.props.children;
  }
}
