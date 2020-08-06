import countries from "country-json/src/country-by-abbreviation.json";
import * as React from "react";
import { useMemo } from "react";
import { WorldMap as ReactSVGWorldMap } from "react-svg-worldmap";
import { chartColors } from "../../config";
import { Elevated } from "./elevated";

interface ICountryAbbreviationByName {
  [name: string]: string;
}

const countryAbbreviationsByName = countries.reduce<ICountryAbbreviationByName>(
  (accumulatedCountries, { abbreviation, country }) => ({
    ...accumulatedCountries,
    [country]: abbreviation.toLowerCase(),
  }),
  {},
);

interface ICounts {
  [country: string]: number;
}

interface IWorldMapProps {
  counts: ICounts;
}

/**
 * A world map colored by the count of each country's value.
 */
export const WorldMap = ({ counts }: IWorldMapProps) => {
  const data = useMemo(() => {
    return [...Object.entries(counts)].map(([country, value]) => ({
      country: countryAbbreviationsByName[country],
      value,
    }));
  }, [counts]);

  return (
    <Elevated level={1}>
      <ReactSVGWorldMap color={chartColors[0]} data={data} size="xl" />
    </Elevated>
  );
};
