import {
  getLoginToken,
  isLoginTokenSet,
  setLoginToken,
} from "../authentication";
import type {
  ApplicationController,
  ExtractControllerMethods,
  IApiMethod,
  IApiRequest,
  IApiResponse,
  SettingsController,
  UsersController,
} from "./types/controllers";
import type { AnswerDTO, FormDTO, SettingsDTO } from "./types/dto";
import { UserRole } from "./types/enums";

type SettingsControllerMethods = ExtractControllerMethods<SettingsController>;
type UsersControllerMethods = ExtractControllerMethods<UsersController>;
type ApplicationControllerMethods = ExtractControllerMethods<
  ApplicationController
>;
type ExtractData<T> = T extends { data: infer K } ? K : never;

/**
 * An api client connected to a backend. Stores the login token in `localStorage`.
 */
export class ApiClient {
  private get headers(): Headers {
    const headers = new Headers();

    if (isLoginTokenSet()) {
      headers.set("Authorization", `Bearer ${getLoginToken()}`);
    }

    return headers;
  }

  public constructor(private readonly _apiBaseUrl: string) {
    if (!_apiBaseUrl) {
      throw new Error("no API base url provided");
    }
  }

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
   * Performs a request to the given url.
   * @param url The resource to perform the request on
   * @param method The method to use
   * @param body An optional body to send with the request
   */
  private async request<TControllerMethod extends IApiMethod<any, any>>(
    url: string,
    method: RequestInit["method"],
    body?: ExtractData<TControllerMethod["takes"]>,
  ): Promise<ExtractData<TControllerMethod["returns"]>> {
    const headers = this.headers;
    const options: RequestInit = {
      headers,
      method,
    };

    if (body) {
      headers.set("Content-Type", "application/json");
      options.body = JSON.stringify(this.packApiRequest(body));
    }

    const response = await fetch(`${this._apiBaseUrl}${url}`, options);
    return this.unpackApiResponse(await response.json());
  }

  /**
   * Sends a GET request to the given resource.
   * @param url The resource to get
   */
  private async get<TControllerMethod extends IApiMethod<any, any>>(
    url: string,
  ): Promise<ExtractData<TControllerMethod["returns"]>> {
    return await this.request<TControllerMethod>(url, "get");
  }

  /**
   * Sends a POST request to the given resource.
   * @param url The resource to get
   */
  private async post<TControllerMethod extends IApiMethod<any, any>>(
    url: string,
    body: ExtractData<TControllerMethod["takes"]>,
  ): Promise<ExtractData<TControllerMethod["returns"]>> {
    return await this.request<TControllerMethod>(url, "post", body);
  }

  /**
   * Sends a PUT request to the given resource.
   * @param url The resource to get
   */
  private async put<TControllerMethod extends IApiMethod<any, any>>(
    url: string,
    body: ExtractData<TControllerMethod["takes"]>,
  ): Promise<ExtractData<TControllerMethod["returns"]>> {
    return await this.request<TControllerMethod>(url, "put", body);
  }

  /**
   * Sends a settings api request.
   */
  public async getSettings(): Promise<SettingsDTO> {
    return await this.get<SettingsControllerMethods["getSettings"]>(
      "/settings",
    );
  }

  /**
   * Sends a signup api request.
   * @param email The user's email
   * @param password The user's password
   */
  public async signup(email: string, password: string): Promise<string> {
    const response = await this.post<UsersControllerMethods["signup"]>(
      "/user/signup",
      {
        email,
        password,
      },
    );

    return response.email;
  }

  /**
   * Verifies a user's email address.
   * @param token The email verification token
   */
  public async verifyEmail(token: string): Promise<void> {
    await this.get<UsersControllerMethods["verify"]>(
      `/user/verify?token=${token}`,
    );
  }

  /**
   * Logs a user in.
   * @param email The user's email
   * @param password The user's password
   */
  public async login(email: string, password: string): Promise<UserRole> {
    const response = await this.post<UsersControllerMethods["login"]>(
      "/user/login",
      {
        email,
        password,
      },
    );

    setLoginToken(response.token);
    return response.role;
  }

  /**
   * Refreshes the login token.
   * @return The user's role
   */
  public async refreshLoginToken(): Promise<UserRole> {
    const response = await this.get<
      UsersControllerMethods["refreshLoginToken"]
    >("/user/refreshtoken");
    setLoginToken(response.token);
    return response.role;
  }

  /**
   * Updates the settings.
   * @param settings The settings to use for updating
   */
  public async updateSettings(settings: SettingsDTO): Promise<SettingsDTO> {
    return await this.put<SettingsControllerMethods["updateSettings"]>(
      "/settings",
      settings,
    );
  }

  /**
   * Gets the profile form for the current user.
   */
  public async getProfileForm(): Promise<FormDTO> {
    return await this.get<ApplicationControllerMethods["getProfileForm"]>(
      "/application/profile",
    );
  }

  /**
   * Stores the answers to the profile form.
   * @param answers The given answers
   */
  public async storeProfileFormAnswers(
    answers: readonly AnswerDTO[],
  ): Promise<void> {
    return await this.post<
      ApplicationControllerMethods["storeProfileFormAnswers"]
    >("/application/profile", answers);
  }

  /**
   * Admits the given user.
   * @param userID The user to admit
   */
  public async admit(userID: number): Promise<void> {
    return await this.put<ApplicationControllerMethods["admit"]>(
      `/application/admit/${userID}`,
      null as never,
    );
  }

  /**
   * Gets the confirmation form for the current user.
   */
  public async getConfirmationForm(): Promise<FormDTO> {
    return await this.get<ApplicationControllerMethods["getConfirmationForm"]>(
      "/application/confirm",
    );
  }

  /**
   * Stores the answers to the confirmation form.
   * @param answers The given answers
   */
  public async storeConfirmationFormAnswers(
    answers: readonly AnswerDTO[],
  ): Promise<void> {
    return await this.post<
      ApplicationControllerMethods["storeConfirmationFormAnswers"]
    >("/application/confirm", answers);
  }
}
