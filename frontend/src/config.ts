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
