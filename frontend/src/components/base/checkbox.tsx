import styled from "@emotion/styled";
import * as React from "react";
import { useCallback } from "react";
import { useUniqueID, useUniqueIDs } from "../../hooks/use-uniqe-id";
import {
  FlexColumnContainer,
  StyleableFlexContainer,
  VerticallyCenteredContainer,
} from "./flex";
import { FormField } from "./form-field";

const ItemContainer = styled(StyleableFlexContainer)`
  padding: 0.5rem 0;
`;

const Label = styled.label`
  padding-left: 0.5rem;
`;

interface ICheckboxesProps {
  radio?: boolean;
  values: string[];
  selected: string[];
  onChange: (selected: string[]) => any;
  title: string;
  mandatory?: boolean;
  isDisabled?: boolean;
}

/**
 * A checkbox group, which can also be displayed as a radio group.
 */
export const Checkboxes = ({
  radio,
  values,
  selected,
  onChange,
  title,
  mandatory,
  isDisabled = false,
}: ICheckboxesProps) => {
  const groupID = useUniqueID();
  const checkboxIDs = useUniqueIDs(values.length);

  const toggleChecked = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const checkedLookup = values.map((value, index) => {
        const isTriggeringInput = event.target.id === checkboxIDs[index];

        if (isTriggeringInput) {
          return event.target.checked;
        } else if (radio) {
          return false;
        }

        return selected.includes(value);
      });

      const selectedValues = values.filter((_, index) => checkedLookup[index]);
      onChange(selectedValues);
    },
    [onChange, values, selected],
  );

  const checkboxes = values.map((checkboxValue, index) => (
    <ItemContainer key={checkboxIDs[index]}>
      <VerticallyCenteredContainer>
        <input
          id={checkboxIDs[index]}
          name={radio ? groupID : undefined}
          checked={selected.includes(checkboxValue)}
          type={radio ? "radio" : "checkbox"}
          onChange={toggleChecked}
          disabled={isDisabled}
        />
        <Label htmlFor={checkboxIDs[index]}>{checkboxValue}</Label>
      </VerticallyCenteredContainer>
    </ItemContainer>
  ));

  return (
    <FormField title={title} mandatory={mandatory}>
      <FlexColumnContainer>{checkboxes}</FlexColumnContainer>
    </FormField>
  );
};
