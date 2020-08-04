import decode from "jwt-decode";

interface ITokenContent {
  exp: number;
}

const tokenLocalStorageName = "tilt_login_token";

/**
 * Gets the login token.
 */
export const getLoginToken = () =>
  localStorage.getItem(tokenLocalStorageName) as string;

/**
 * Gets whether the login token is currently set.
 */
export const isLoginTokenSet = () => {
  const token = getLoginToken();

  if (!token) {
    return false;
  }

  const content = decode(token) as ITokenContent;
  const expiresOn = new Date(content.exp * 1000);

  if (expiresOn.getTime() < Date.now()) {
    clearLoginToken();
    return false;
  }

  return true;
};

/**
 * Sets the login token.
 * @param token The login token
 */
export const setLoginToken = (token: string) =>
  localStorage.setItem(tokenLocalStorageName, token);

/**
 * Clears the login token.
 */
export const clearLoginToken = () =>
  localStorage.removeItem(tokenLocalStorageName);
