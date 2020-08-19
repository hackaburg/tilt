import styled from "@emotion/styled";
import * as React from "react";
import {
  CenteredContainer,
  FlexColumnContainer,
  StyleableFlexContainer,
} from "./flex";

const TitledNumberContainer = styled(StyleableFlexContainer)`
  padding: 1rem 0;
`;

const Big = styled(StyleableFlexContainer)`
  font-size: 2rem;
  padding: 0.5rem 0;
`;

const Title = styled(StyleableFlexContainer)`
  font-size: 1rem;
`;

interface ITitledNumberProps {
  title: string;
  value: number | string;
}

/**
 * A number with a title.
 */
export const TitledNumber = ({ title, value }: ITitledNumberProps) => (
  <TitledNumberContainer>
    <FlexColumnContainer>
      <CenteredContainer>
        <Big>{value}</Big>
        <Title>{title}</Title>
      </CenteredContainer>
    </FlexColumnContainer>
  </TitledNumberContainer>
);
