import styled from "@emotion/styled";
import * as React from "react";
import { useCallback } from "react";
import { useUniqueID, useUniqueIDs } from "../hooks/use-uniqe-id";
import { FormField } from "./form-field";

const Container = styled.div`
  margin: 0.75rem 0rem;
`;

const Item = styled.div`
  margin: 0.5rem 0rem;
`;

const Input = styled.input`
  margin-right: 1rem;
`;

interface ICheckboxesProps {
  radio?: boolean;
  values: string[];
  selected: string[];
  onChange: (selected: string[]) => any;
  title?: string;
  mandatory?: boolean;
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
    <Item key={checkboxIDs[index]}>
      <Input
        id={checkboxIDs[index]}
        name={radio ? groupID : undefined}
        checked={selected.includes(checkboxValue)}
        type={radio ? "radio" : "checkbox"}
        onChange={toggleChecked}
      />
      <label htmlFor={checkboxIDs[index]}>{checkboxValue}</label>
    </Item>
  ));

  return (
    <FormField
      active={false}
      empty={false}
      borderBottom={false}
      title={title}
      mandatory={mandatory}
    >
      <Container>{checkboxes}</Container>
    </FormField>
  );
};
