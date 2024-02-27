/**
 * Indicates whether the frontend is currently built in production.
 */
export const isProductionEnabled = process.env.NODE_ENV === "production";

const environmentBaseURL = process.env.API_BASE_URL ?? "";

/**
 * The document's base url, as defined by `<base />`.
 */
export const documentBaseURL =
  document.querySelector("base")?.getAttribute("href")?.replace(/\/+$/, "") ??
  "";

/**
 * The base url to a tilt backend.
 */
export const apiBaseUrl = environmentBaseURL.startsWith("http:")
  ? environmentBaseURL
  : `${documentBaseURL}${environmentBaseURL}`;

/**
 * The default transition duration.
 */
export const transitionDuration = "0.2s";

/**
 * The default border radius.
 */
export const borderRadius = "5px";

/**
 * The sidebar width.
 */
export const sidebarWidth = "min(300px, 70vw)";

/**
 * The duration to show notifications.
 */
export const notificationDuration = 8000;

/**
 * The duration to use for debouncing events.
 */
export const debounceDuration = 1000;

/**
 * The default theme color, used while the theme is still loading.
 */
export const defaultThemeColor = "#333";

/**
 * The background color of the loading placeholder shimmer.
 */
export const shimmerBackgroundColor = "#f7f7f7";

/**
 * The color of the loading placeholder shimmer.
 */
export const shimmerColor = "#fefefe";

/**
 * The CSS breakpoints to determine whether a device is a tablet or a phone.
 */
export const mediaBreakpoints = {
  phone: "767px",
  tablet: "1024px",
};

const chartColorMap = {
  blue: "rgb(54, 162, 235)",
  green: "rgb(75, 192, 192)",
  grey: "rgb(201, 203, 207)",
  orange: "rgb(255, 159, 64)",
  purple: "rgb(153, 102, 255)",
  black: "rgb(0, 0, 0)",
  greenSpecial: "rgb(86, 209, 117)",
};

/**
 * Colors for charts, taken from chartjs.org
 */
export const chartColors = [
  chartColorMap.black,
  chartColorMap.greenSpecial,
  chartColorMap.blue,
  chartColorMap.orange,
  chartColorMap.purple,
  chartColorMap.green,
  chartColorMap.grey,
];

/**
 * `chartColors` made slightly transparent.
 */
export const transparentChartColors = chartColors.map((color) =>
  color.replace(")", ", 0.25)"),
);

/**
 * The size of a horizontal or vertical spacer.
 */
export const spacerSize = "1rem";
