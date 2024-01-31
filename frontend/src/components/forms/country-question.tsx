import countries from "country-json/src/country-by-abbreviation.json";
import * as React from "react";
import type {
  CountryQuestionConfigurationDTO,
  QuestionDTO,
} from "../../api/types/dto";
import { Autocomplete, TextField } from "@mui/material";
import { FormField } from "../base/form-field";
import { useCallback } from "react";

/**
 * A list of countries known to tilt.
 */
export const countryNames = countries.map(({ country }) => country).sort();

interface ICountryQuestionProps {
  question: QuestionDTO<CountryQuestionConfigurationDTO>;
  valueInput: string;
  onChange: (event: React.SyntheticEvent, value: string) => any;
  isDisabled?: boolean;
}

/**
 * A question to select the country a user is from.
 * Basically a choices question, but separating it allows better visualization.
 */
export const CountryQuestion = ({
  valueInput,
  onChange,
  question,
  isDisabled,
}: ICountryQuestionProps) => {
  const handleChange = useCallback(
    (event: React.SyntheticEvent, value: string | null) =>
      onChange(event, value!),
    [onChange],
  );

  return (
    <div>
      <FormField title={question.title} mandatory={question.mandatory}>
        <Autocomplete
          disablePortal
          options={countryNames}
          fullWidth
          renderInput={(params) => (
            <TextField {...params} label={question.description} />
          )}
          disabled={isDisabled}
          onChange={handleChange}
          value={valueInput}
        />
      </FormField>
    </div>
  );
};
