import { api } from "../api";
import { RequestTarget } from "../state";
import { performRequest } from "./request";

/**
 * Sends a verification email
 * @param token The token from the verification email
 */
export const verifyEmail = (token: string) =>
  performRequest(RequestTarget.VerifyEmail, async () => {
    await api.verifyEmail(token);
  });
