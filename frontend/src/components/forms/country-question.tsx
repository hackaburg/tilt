import countries from "country-json/src/country-by-abbreviation.json";
import * as React from "react";
import type {
  CountryQuestionConfigurationDTO,
  QuestionDTO,
} from "../../api/types/dto";
import { Select } from "../base/select";

/**
 * A list of countries known to tilt.
 */
export const countryNames = countries.map(({ country }) => country).sort();

interface ICountryQuestionProps {
  question: QuestionDTO<CountryQuestionConfigurationDTO>;
  value: string;
  onChange: (value: string) => any;
  isDisabled?: boolean;
}

/**
 * A question to select the country a user is from.
 * Basically a choices question, but separating it allows better visualization.
 */
export const CountryQuestion = ({
  value,
  onChange,
  question,
  isDisabled,
}: ICountryQuestionProps) => (
  <Select
    mandatory={question.mandatory}
    title={question.title}
    value={value}
    values={countryNames}
    onChange={onChange}
    isDisabled={isDisabled}
  />
);
