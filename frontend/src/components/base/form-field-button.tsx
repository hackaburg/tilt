import styled from "@emotion/styled";
import * as React from "react";
import FlexView from "react-flexview";

const ButtonContainer = styled(FlexView)`
  padding-bottom: 1.1rem;
`;

interface IFormFieldButtonProps {
  field: FlexView.Props["children"];
  button: FlexView.Props["children"];
}

/**
 * A wrapper around a form field with a button.
 */
export const FormFieldButton = ({ field, button }: IFormFieldButtonProps) => (
  <FlexView shrink={false} vAlignContent="bottom">
    <FlexView column grow>
      {field}
    </FlexView>

    <FlexView width="1rem" shrink={false} />

    <ButtonContainer column shrink>
      {button}
    </ButtonContainer>
  </FlexView>
);
