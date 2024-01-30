import styled from "@emotion/styled";
import * as React from "react";
import { StyleableFlexContainer } from "./flex";

const FormFieldContainer = styled(StyleableFlexContainer)`
  padding: 0.5rem 0;
`;

const Title = styled.label`
  display: block;
  padding-bottom: 0.5rem;
  font-size: 0.9rem;
  font-weight: bold;
`;

const MandatoryIndicator = styled.span`
  color: red;
`;

interface IFormFieldProps {
  children: React.ReactChild;
  title: string;
  mandatory?: boolean;
}

/**
 * A form field.
 */
export const FormField = ({ title, children, mandatory }: IFormFieldProps) => (
  <FormFieldContainer>
    <Title>
      {title}
      {mandatory && <MandatoryIndicator>*</MandatoryIndicator>}
    </Title>
    {children}
  </FormFieldContainer>
);
