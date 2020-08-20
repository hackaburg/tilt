import styled from "@emotion/styled";
import * as React from "react";
import { Nullable } from "../../state";
import { CopyableText } from "./copyable-text";
import {
  CenteredContainer,
  PageSizedContainer,
  StyleableFlexContainer,
} from "./flex";
import { Heading } from "./headings";
import { ExternalLink } from "./link";
import { Text } from "./text";

const ErrorContainer = styled(StyleableFlexContainer)`
  width: 300px;
`;

interface IRenderError {
  exception: Error;
  info: React.ErrorInfo;
}

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
      const message = `${exception.name}: ${exception.message}\n${exception.stack}\n\nComponent stack:${info.componentStack}`;

      return (
        <PageSizedContainer>
          <CenteredContainer>
            <ErrorContainer>
              <Heading text="Uh-oh, everything is on fire 🔥🔥🔥🔥🔥🔥🔥🔥🔥" />

              <Text>
                While this shouldn't have happened in the first place, we'd be
                happy if you report this error on our{" "}
                <ExternalLink to="https://github.com/hackaburg/tilt/issues/new">
                  issue tracker
                </ExternalLink>
                .
              </Text>

              <Text>
                You can include this error log along a quick description to
                reproduce this issue:
              </Text>

              <CopyableText text={message} />
            </ErrorContainer>
          </CenteredContainer>
        </PageSizedContainer>
      );
    }

    return this.props.children;
  }
}
