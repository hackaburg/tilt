import * as React from "react";
import { countryNames } from "./country-question";

/**
 * A pseud-editor for country questions.
 * @see CountryQuestion
 */
export const CountryQuestionEditor = () => (
  <p>
    Tilt currently knows about{" "}
    <a href="https://github.com/samayo/country-json" target="_blank">
      {countryNames.length} countries
    </a>
    . If you're missing a country or you started a Mars colony and we should add
    it to these options, please file an issue on the{" "}
    <a href="https://github.com/hackaburg/tilt/issues/new" target="_blank">
      tilt repository
    </a>
    .
  </p>
);
