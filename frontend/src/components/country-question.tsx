import * as countries from "country-json/src/country-by-abbreviation.json";
import * as React from "react";
import { CountryQuestionConfigurationDTO, QuestionDTO } from "../api/types";
import { Select } from "./select";

const countryNames = countries.map(({ country }) => country).sort();

interface ICountryQuestionProps {
  editable?: boolean;
  question: QuestionDTO<CountryQuestionConfigurationDTO>;
  value: string;
  onChange: (value: string) => any;
}

/**
 * A question to select the country a user is from.
 * Basically a choices question, but separating it allows better visualization.
 */
export const CountryQuestion = ({
  value,
  onChange,
  question,
  editable,
}: ICountryQuestionProps) => {
  if (editable) {
    return (
      <p>
        Tilt currently knows about{" "}
        <a href="https://github.com/samayo/country-json" target="_blank">
          {countryNames.length} countries
        </a>
        . If you started a Mars colony in the meantime and we should add it to
        these options, please file an issue on the{" "}
        <a href="https://github.com/hackaburg/tilt/issues/new" target="_blank">
          tilt repository
        </a>
        .
      </p>
    );
  }

  return (
    <Select
      mandatory={question.mandatory}
      title={question.title}
      value={value}
      values={countryNames}
      onChange={onChange}
    />
  );
};
