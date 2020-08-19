import styled from "@emotion/styled";
import * as React from "react";
import { mediaBreakpoints } from "../../config";
import {
  FlexRowColumnContainer,
  FlexRowContainer,
  Spacer,
  StyleableFlexContainer,
} from "./flex";

const ButtonContainer = styled(StyleableFlexContainer)`
  padding-top: 2.6rem;

  @media screen and (max-width: ${mediaBreakpoints.tablet}) {
    padding: 0;
  }
`;

interface IFormFieldButtonProps {
  field: React.ReactNode;
  button: React.ReactNode;
}

/**
 * A wrapper around a form field with a button.
 */
export const FormFieldButton = ({ field, button }: IFormFieldButtonProps) => (
  <FlexRowContainer>
    <FlexRowColumnContainer isBig>{field}</FlexRowColumnContainer>

    <Spacer />

    <ButtonContainer>{button}</ButtonContainer>
  </FlexRowContainer>
);
