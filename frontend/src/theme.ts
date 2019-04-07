import { ThemeProps } from "styled-components";

/**
 * Describes the theme's variables.
 */
export interface ITheme {
  colorGradientStart: string;
  colorGradientEnd: string;
}

/**
 * Props for a styled-components theme.
 */
export type IThemeProps = ThemeProps<ITheme>;
