import * as React from "react";
import { useState } from "react";
import styled from "styled-components";
import { useUniqueId, useUniqueIds } from "../hooks/use-uniqe-id";
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
export const Checkboxes = ({ radio, values, selected, onChange, title, mandatory }: ICheckboxesProps) => {
  const groupId = useUniqueId();
  const checkboxesIds = useUniqueIds(values.length);
  const valuesAsChecked = values.map((value) => selected.includes(value));
  const [checked, setChecked] = useState(valuesAsChecked);
  const toggleChecked = (checkedIndex: number) => {
    const updatedChecked =
      radio
        ? new Array(values.length).fill(false)
        : [
          ...checked,
        ];

    updatedChecked[checkedIndex] = !updatedChecked[checkedIndex];
    setChecked(updatedChecked);

    const checkedValues =
      values
        .map((value, index) => ({
          checked: updatedChecked[index],
          value,
        }))
        .filter((value) => value.checked)
        .map(({ value }) => value);

    onChange(checkedValues);
  };

  const checkboxes = values.map((checkboxValue, index) => (
    <Item key={checkboxesIds[index]}>
      <Input
        id={checkboxesIds[index]}
        name={radio ? groupId : undefined}
        checked={selected.includes(checkboxValue)}
        type={radio ? "radio" : "checkbox"}
        onChange={() => toggleChecked(index)}
      />
      <label htmlFor={checkboxesIds[index]}>{checkboxValue}</label>
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
      <Container>
        {checkboxes}
      </Container>
    </FormField>
  );
};
