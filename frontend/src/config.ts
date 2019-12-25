/**
 * Indicates whether the frontend is currently built in production.
 */
export const isProductionEnabled = process.env.NODE_ENV === "production";

/**
 * The base url to a tilt backend.
 */
export const apiBaseUrl = process.env.API_BASE_URL as string;

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
export const sidebarWidth = "300px";

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
 * The size of the column's padding.
 */
export const gridColumnPadding = "0.5rem";

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
