import countries from "country-json/src/country-by-abbreviation.json";
import * as React from "react";
import type {
  CountryQuestionConfigurationDTO,
  QuestionDTO,
} from "../../api/types/dto";
import { Autocomplete, Box, TextField } from "@mui/material";
import { FormField } from "../base/form-field";
import { useCallback } from "react";

/**
 * A list of countries known to tilt.
 */

interface ICountryQuestionProps {
  question: QuestionDTO<CountryQuestionConfigurationDTO>;
  valueInput: string;
  onChange: (value: string) => any;
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
  return (
    <div>
      <FormField title={question.title} mandatory={question.mandatory}>
        <Autocomplete
          disablePortal
          options={countries}
          getOptionLabel={(option) => option.country}
          fullWidth
          autoHighlight
          onChange={(e, v) => onChange(v?.country ?? "")}
          renderInput={(params) => (
            <TextField {...params} label={question.description} />
          )}
          value={countries.find((c) => c.country === valueInput) ?? null}
          disabled={isDisabled}
          renderOption={(props, option) => (
            <Box
              component="li"
              sx={{ "& > img": { mr: 2, flexShrink: 0 } }}
              {...props}
            >
              <img
                loading="lazy"
                width="20"
                srcSet={`https://flagcdn.com/w40/${option.abbreviation.toLowerCase()}.png 2x`}
                src={`https://flagcdn.com/w20/${option.abbreviation.toLowerCase()}.png`}
                alt=""
              />
              {option.country}
            </Box>
          )}
        />
      </FormField>
    </div>
  );
};
