import { api } from "../api";
import { RequestTarget } from "../state";
import { performRequest } from "./request";

/**
 * Asynchronously signs the user up.
 * @param email The user's email
 * @param password The user's password
 */
export const signup = (email: string, password: string) =>
  performRequest(RequestTarget.Signup, async () => {
    await api.signup(email, password);
  });
