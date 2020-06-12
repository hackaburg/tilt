import { IApi } from ".";
import {
  getLoginToken,
  isLoginTokenSet,
  setLoginToken,
} from "../authentication";
import {
  ExtractControllerMethods,
  IApiMethod,
  IApiRequest,
  IApiResponse,
  SettingsController,
  SettingsDTO,
  UserRole,
  UsersController,
} from "./types";

type SettingsControllerMethods = ExtractControllerMethods<SettingsController>;
type UsersControllerMethods = ExtractControllerMethods<UsersController>;
type ExtractData<T> = T extends { data: infer K } ? K : never;

/**
 * An api client connected to a backend. Stores the login token in `localStorage`.
 */
export class BackendApi implements IApi {
  private get headers(): Headers {
    const headers = new Headers();

    if (isLoginTokenSet()) {
      headers.set("Authorization", `Bearer ${getLoginToken()}`);
    }

    return headers;
  }

  public constructor(private readonly _apiBaseUrl: string) {}

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
  protected async get<TControllerMethod extends IApiMethod<any, any>>(
    url: string,
  ): Promise<ExtractData<TControllerMethod["returns"]>> {
    return await this.request<TControllerMethod>(url, "get");
  }

  /**
   * Sends a POST request to the given resource.
   * @param url The resource to get
   */
  protected async post<TControllerMethod extends IApiMethod<any, any>>(
    url: string,
    body: ExtractData<TControllerMethod["takes"]>,
  ): Promise<ExtractData<TControllerMethod["returns"]>> {
    return await this.request<TControllerMethod>(url, "post", body);
  }

  /**
   * Sends a PUT request to the given resource.
   * @param url The resource to get
   */
  protected async put<TControllerMethod extends IApiMethod<any, any>>(
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
}
