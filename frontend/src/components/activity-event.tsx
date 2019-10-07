import * as React from "react";
import { useState } from "react";
import styled from "styled-components";
import { ActivityType, IActivity } from "../../../types/activity";
import { borderRadius, transitionDuration } from "../config";
import { Nullable } from "../state";
import { IThemeProps } from "../theme";
import { dateToString } from "../util";
import { DiffEditor } from "./diff-editor";

const Container = styled.div`
  margin-bottom: 1rem;
`;

interface IBodyProps {
  shown: boolean;
}

const Body = styled.div<IBodyProps>`
  opacity: 0;
  padding: 0rem 1rem;
  height: 0rem;
  overflow: hidden;

  ${({ shown }) =>
    shown &&
    `
    opacity: 1;
    height: calc(40vh + 2rem);
    padding: 1rem;
  `}

  border-radius: ${borderRadius};
  box-shadow: 0px 5px 10px rgba(0, 0, 0, 0.05);
  transition-property: height, opacity, padding;
  transition-duration: ${transitionDuration};
`;

interface ITitleProps {
  clickable: boolean;
}

const Title = styled.h3<ITitleProps>`
  margin: 0rem;
  font-weight: normal;
  font-size: 0.9rem;

  ${({ clickable }) =>
    clickable &&
    `
    cursor: pointer;
  `}
`;

const Accent = styled.span`
  color: ${({ theme }: IThemeProps) => theme.colorGradientEnd};
`;

const Time = styled.div`
  margin-bottom: 1rem;
  font-size: 0.75;
  opacity: 0.5;
`;

interface IClickIndicatorProps {
  clicked: boolean;
}

const ClickIndicator = styled.button<IClickIndicatorProps>`
  display: inline-block;
  margin: 0rem 0.5rem;
  border: none;

  color: currentColor;
  background-color: transparent;
  cursor: pointer;

  transition-property: transform;
  transition-duration: ${transitionDuration};

  ${({ clicked }) =>
    clicked &&
    `
    transform: rotateZ(90deg);
  `}
`;

const getActivityText = (type: ActivityType) => {
  switch (type) {
    case ActivityType.Signup:
      return "Signup";

    case ActivityType.EmailVerified:
      return "E-mail verified";

    case ActivityType.SettingsUpdate:
      return "Settings updated";
  }
};

interface IActivityEventProps {
  event: IActivity;
}

/**
 * An activity event.
 */
export const ActivityEvent = ({ event }: IActivityEventProps) => {
  const [showBody, setShowBody] = useState(false);
  let body: Nullable<JSX.Element> = null;

  switch (event.data.type) {
    case ActivityType.SettingsUpdate:
      body = (
        <DiffEditor
          language="json"
          left={event.data.previous}
          right={event.data.next}
        />
      );
      break;
  }

  return (
    <Container>
      <Title onClick={() => setShowBody((value) => !value)} clickable={!!body}>
        {getActivityText(event.data.type)} by{" "}
        <Accent>{event.user.email}</Accent>
        {body && <ClickIndicator clicked={showBody}>&#9658;</ClickIndicator>}
      </Title>

      <Time>{dateToString(new Date(event.timestamp))}</Time>

      {body && <Body shown={showBody}>{showBody && body}</Body>}
    </Container>
  );
};
