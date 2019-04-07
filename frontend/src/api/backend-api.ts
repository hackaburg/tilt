import { IApi } from ".";
import { IApiRequest, IApiResponse, ISuccessfullyUnpackedApiResponse } from "../../../types/api";
import { ISettings } from "../../../types/settings";
import { IUserLoginRequestBody, IUserLoginResponseBody } from "../../../types/user-login";
import { IUserSignupRequestBody, IUserSignupResponseBody } from "../../../types/user-signup";
import { IUserVerifyResponseBody } from "../../../types/user-verify";

const tokenLocalStorageName = "tilt_login_token";

/**
 * An api client connected to a backend. Stores the login token in `localStorage`.
 */
export class BackendApi implements IApi {
  private get token(): string {
    return localStorage.getItem(tokenLocalStorageName) as string;
  }

  private set token(value: string) {
    localStorage.setItem(tokenLocalStorageName, value);
  }

  private get headers(): Headers {
    const headers = new Headers();
    const token = this.token;

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    return headers;
  }

  public constructor(
    private readonly _apiBaseUrl: string,
  ) { }

  /**
   * Packs the body in the api request structure.
   * @param body The body to send
   */
  private packApiRequest<TBody>(body: TBody): IApiRequest<TBody> {
    return {
      data: body,
    };
  }

  /**
   * Unpacks the body received from the api.
   * @param body The body received from the api
   */
  private unpackApiResponse<TBody>(body: IApiResponse<TBody>): TBody {
    if (body.status === "ok") {
      return body.data;
    }

    throw new Error(body.error);
  }

  /**
   * Sends a GET request to the given resource.
   * @param url The resource to get
   */
  protected async get<TResponse>(url: string): Promise<ISuccessfullyUnpackedApiResponse<TResponse>> {
    const response = await fetch(`${this._apiBaseUrl}${url}`, {
      headers: this.headers,
      method: "get",
    });

    return this.unpackApiResponse(await response.json());
  }

  /**
   * Sends a POST request to the given resource.
   * @param url The resource to get
   */
  protected async post<TBody, TResponse>(url: string, body: TBody): Promise<ISuccessfullyUnpackedApiResponse<TResponse>> {
    const headers = this.headers;
    headers.set("Content-Type", "application/json");

    const response = await fetch(`${this._apiBaseUrl}${url}`, {
      body: JSON.stringify(this.packApiRequest(body)),
      headers,
      method: "post",
    });

    return this.unpackApiResponse(await response.json());
  }

  /**
   * Sends a settings api request.
   */
  public async getSettings(): Promise<ISettings> {
    return await this.get<ISettings>("/settings");
  }

  /**
   * Sends a signup api request.
   * @param email The user's email
   * @param password The user's password
   */
  public async signup(email: string, password: string): Promise<string> {
    const response = await this.post<IUserSignupRequestBody, IUserSignupResponseBody>("/user/signup", {
      email,
      password,
    });

    return response.email;
  }

  /**
   * Verifies a user's email address.
   * @param token The email verification token
   */
  public async verfiyEmail(token: string): Promise<void> {
    await this.get<IUserVerifyResponseBody>(`/user/verify?token=${token}`);
  }

  /**
   * Logs a user in.
   * @param email The user's email
   * @param password The user's password
   */
  public async login(email: string, password: string): Promise<void> {
    const response = await this.post<IUserLoginRequestBody, IUserLoginResponseBody>("/user/login", {
      email,
      password,
    });

    this.token = response.token;
  }
}
