import styled from "@emotion/styled";
import * as React from "react";
import FlexView from "react-flexview";

const TitledNumberContainer = styled(FlexView)`
  padding: 1rem 0;
`;

const Big = styled(FlexView)`
  font-size: 2rem;
  padding: 0.5rem 0;
`;

const Title = styled(FlexView)`
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
  <TitledNumberContainer column hAlignContent="center" shrink={false}>
    <Big shrink={false}>{value}</Big>
    <Title shrink={false}>{title}</Title>
  </TitledNumberContainer>
);
