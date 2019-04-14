const tokenLocalStorageName = "tilt_login_token";

/**
 * Gets the login token.
 */
export const getLoginToken = () => localStorage.getItem(tokenLocalStorageName) as string;

/**
 * Gets whether the login token is currently set.
 */
export const isLoginTokenSet = () => !!getLoginToken();

/**
 * Sets the login token.
 * @param token The login token
 */
export const setLoginToken = (token: string) => localStorage.setItem(tokenLocalStorageName, token);

/**
 * Clears the login token.
 */
export const clearLoginToken = () => localStorage.removeItem(tokenLocalStorageName);
