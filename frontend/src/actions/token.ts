import { api } from "../api";
import { RequestTarget } from "../state";
import { performRequest } from "./request";

/**
 * Asynchronously refreshes the login token.
 */
export const refreshLoginToken = () => performRequest(RequestTarget.RefreshLoginToken, async () => {
  await api.refreshLoginToken();
});
