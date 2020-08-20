import styled from "@emotion/styled";
import * as React from "react";

interface IHeadingProps {
  text: string;
}

const H1 = styled.h1`
  font-size: 1.5rem;
  margin: 0;
  padding: 0.25rem 0;
`;

/**
 * A heading used to head something.
 */
export const Heading = ({ text }: IHeadingProps) => <H1>{text}</H1>;

const H2 = styled.h2`
  font-size: 1.25rem;
  font-weight: normal;
  margin: 0;
  padding: 0.75rem 0;
`;

/**
 * A subheading, can be used to structure things after a @see Header.
 */
export const Subheading = ({ text }: IHeadingProps) => <H2>{text}</H2>;

const H3 = styled.h3`
  font-size: 1.1rem;
  font-weight: normal;
  margin: 0;
  padding: 0.5rem 0;
`;

/**
 * A heading beneath @see Subheading
 */
export const Subsubheading = ({ text }: IHeadingProps) => <H3>{text}</H3>;
