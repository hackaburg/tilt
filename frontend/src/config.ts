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
export const notificationDuration = 3000;

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
 * The size of the grid's spacers.
 */
export const gridSpacing = "1rem";

/**
 * The CSS breakpoints to determine whether a device is a tablet or a phone.
 */
export const mediaBreakpoints = {
  phone: "767px",
  tablet: "1024px",
};

/**
 * The height of the top navigation bar.
 */
export const headerBarHeight = "50px";

/**
 * The delay between attempts to reconnect the WebSocket.
 */
export const websocketReconnectDelayMilliseconds = 5 * 1000;

/**
 * The maximum number of attempts to reconnect the WebSocket.
 */
export const websocketReconnectMaxAttempts = 10;

const chartColorMap = {
  blue: "rgb(54, 162, 235)",
  green: "rgb(75, 192, 192)",
  grey: "rgb(201, 203, 207)",
  orange: "rgb(255, 159, 64)",
  purple: "rgb(153, 102, 255)",
  red: "rgb(255, 99, 132)",
  yellow: "rgb(255, 205, 86)",
};

/**
 * Colors for charts, taken from chartjs.org
 */
export const chartColors = [
  chartColorMap.red,
  chartColorMap.yellow,
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
