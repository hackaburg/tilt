import {
  getLoginToken,
  isLoginTokenSet,
  setLoginToken,
} from "../authentication";
import { Nullable } from "../util";
import type {
  ApplicationController,
  ExtractControllerMethods,
  IApiMethod,
  IApiRequest,
  IApiResponse,
  SettingsController,
  SystemController,
  UsersController,
} from "./types/controllers";
import type {
  AnswerDTO,
  ApplicationDTO,
  FormDTO,
  SettingsDTO,
  UserDTO,
} from "./types/dto";

type SettingsControllerMethods = ExtractControllerMethods<SettingsController>;
type UsersControllerMethods = ExtractControllerMethods<UsersController>;
type ApplicationControllerMethods =
  ExtractControllerMethods<ApplicationController>;
type SystemControllerMethods = ExtractControllerMethods<SystemController>;
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
   * @param url The resource to post
   * @param body The body to send
   */
  private async post<TControllerMethod extends IApiMethod<any, any>>(
    url: string,
    body: ExtractData<TControllerMethod["takes"]>,
  ): Promise<ExtractData<TControllerMethod["returns"]>> {
    return await this.request<TControllerMethod>(url, "post", body);
  }

  /**
   * Sends a PUT request to the given resource.
   * @param url The resource to put
   * @param body The body to send
   */
  private async put<TControllerMethod extends IApiMethod<any, any>>(
    url: string,
    body: ExtractData<TControllerMethod["takes"]>,
  ): Promise<ExtractData<TControllerMethod["returns"]>> {
    return await this.request<TControllerMethod>(url, "put", body);
  }

  /**
   * Sends a DELETE request to the given resource.
   * @param url The resource to delete
   */
  private async delete<TControllerMethod extends IApiMethod<any, any>>(
    url: string,
  ): Promise<ExtractData<TControllerMethod["returns"]>> {
    return await this.request<TControllerMethod>(url, "delete");
  }

  /**
   * Attempts to revive a stringified date to an actual `Date` object.
   * @param date The date to revive
   */
  private reviveDate<T extends Date | Nullable<Date>>(date: T): T {
    if (date == null) {
      return null as T;
    }

    return new Date(date as any) as T;
  }

  /**
   * Revives dates in the settings object.
   * @param settings The settings to revive
   */
  private reviveSettings(settings: SettingsDTO): SettingsDTO {
    return {
      ...settings,
      application: {
        ...settings.application,
        allowProfileFormFrom: this.reviveDate(
          settings.application.allowProfileFormFrom,
        ),
        allowProfileFormUntil: this.reviveDate(
          settings.application.allowProfileFormUntil,
        ),
      },
    };
  }

  /**
   * Revievs dates in the given user object.
   * @param user The user to revive
   */
  private reviveUser(user: UserDTO): UserDTO {
    return {
      ...user,
      confirmationExpiresAt: this.reviveDate(user.confirmationExpiresAt),
      createdAt: this.reviveDate(user.createdAt),
      initialProfileFormSubmittedAt: this.reviveDate(
        user.initialProfileFormSubmittedAt,
      ),
    };
  }

  /**
   * Sends a settings api request.
   */
  public async getSettings(): Promise<SettingsDTO> {
    const response = await this.get<SettingsControllerMethods["getSettings"]>(
      "/settings",
    );

    return this.reviveSettings(response);
  }

  /**
   * Sends a signup api request.
   * @param email The user's email
   * @param password The user's password
   */
  public async signup(
    firstName: string,
    lastName: string,
    email: string,
    password: string,
  ): Promise<string> {
    const response = await this.post<UsersControllerMethods["signup"]>(
      "/user/signup",
      {
        firstName,
        lastName,
        email,
        password,
      },
    );

    return response.email;
  }

  /**
   * Forgot password
   * @param email The user's email
   */
  public async forgotPassword(email: string): Promise<string> {
    const response = await this.post<UsersControllerMethods["forgotPassword"]>(
      "/user/forgot-password",
      {
        email,
      },
    );

    return response.message;
  }

  /**
   * Reset password
   * @param password The new user's password
   * @param token The reset token
   */
  public async resetPassword(
    password: string,
    token: string,
  ): Promise<boolean> {
    const response = await this.post<UsersControllerMethods["resetPassword"]>(
      "/user/reset-password",
      {
        password,
        token,
      },
    );

    return response.success;
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
   * Logs a user in and gets the user's status.
   * @param email The user's email
   * @param password The user's password
   */
  public async login(email: string, password: string): Promise<UserDTO> {
    const response = await this.post<UsersControllerMethods["login"]>(
      "/user/login",
      {
        email,
        password,
      },
    );

    setLoginToken(response.token);
    return this.reviveUser(response.user);
  }

  /**
   * Refreshes the login token and returns the current user status.
   */
  public async refreshLoginToken(): Promise<UserDTO> {
    const response = await this.get<
      UsersControllerMethods["refreshLoginToken"]
    >("/user/refreshtoken");
    setLoginToken(response.token);
    return this.reviveUser(response.user);
  }

  /**
   * Updates the settings.
   * @param settings The settings to use for updating
   */
  public async updateSettings(settings: SettingsDTO): Promise<SettingsDTO> {
    const response = await this.put<
      SettingsControllerMethods["updateSettings"]
    >("/settings", settings);

    return this.reviveSettings(response);
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
   * Admits the given users.
   * @param userIDs The users to admit
   */
  public async admit(userIDs: readonly number[]): Promise<void> {
    return await this.put<ApplicationControllerMethods["admit"]>(
      "/application/admit",
      userIDs,
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

  /**
   * Gets all applications with users and their answers.
   */
  public async getAllApplications(): Promise<readonly ApplicationDTO[]> {
    const response = await this.get<
      ApplicationControllerMethods["getAllApplications"]
    >("/application/all");

    return response.map((application) => ({
      ...application,
      user: this.reviveUser(application.user),
    }));
  }

  /**
   * Deletes the user with the given id.
   * @param userID The id of the user to delete
   */
  public async deleteUser(userID: number): Promise<void> {
    await this.delete<UsersControllerMethods["deleteUser"]>(`/user/${userID}`);
  }

  /**
   * Declines the user's spot.
   */
  public async declineSpot(): Promise<void> {
    await this.delete<ApplicationControllerMethods["declineSpot"]>(
      "/application/confirm",
    );
  }

  /**
   * Checks in the given user.
   * @param userID The id of the user to check in
   */
  public async checkIn(userID: number): Promise<void> {
    await this.put<ApplicationControllerMethods["checkIn"]>(
      "/application/checkin",
      userID,
    );
  }

  /**
   * Prunes all system data.
   */
  public async pruneSystem(): Promise<void> {
    await this.delete<SystemControllerMethods["prune"]>("/system/prune");
  }
}
