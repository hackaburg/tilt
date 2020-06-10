import * as React from "react";

const variableNames = {
  colorGradientEnd: "--color-gradient-end",
  colorGradientStart: "--color-gradient-start",
  colorLink: "--color-link",
  colorLinkHover: "--color-link-hover",
};

type Variables = typeof variableNames;

/**
 * CSS variables for our theme.
 */
export const variables = [...Object.entries(variableNames)].reduce(
  (accumulator, [name, variable]) => ({
    ...accumulator,
    [name]: `var(${variable})`,
  }),
  {},
) as Variables;

interface IThemeProviderProps {
  children: any;
  values: Variables;
}

/**
 * A theme provider based on CSS variables.
 */
export const ThemeProvider = ({ children, values }: IThemeProviderProps) => {
  const css = [...Object.entries(values)]
    .map(([key, value]) => {
      const variable = variableNames[key as keyof Variables];

      if (!variable) {
        return "";
      }

      return `${variable}: ${value};`;
    })
    .join("");

  return (
    <>
      <style>{`html{${css}}`}</style>
      {children}
    </>
  );
};
