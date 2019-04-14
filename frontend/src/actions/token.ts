import { api } from "../api";
import { performRequest } from "./request";

/**
 * Asynchronously refreshes the login token.
 */
export const refreshLoginToken = () => performRequest(async () => {
  await api.refreshLoginToken();
});
