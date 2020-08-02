import styled from "@emotion/styled";
import * as React from "react";
import FlexView from "react-flexview";

const FormFieldContainer = styled(FlexView)`
  padding: 1rem 0;
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
  <FormFieldContainer column>
    <Title>
      {title}
      {mandatory && <MandatoryIndicator>*</MandatoryIndicator>}
    </Title>

    {children}
  </FormFieldContainer>
);
