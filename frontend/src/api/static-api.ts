import { IApi } from ".";
import { sleep } from "../util";
import { SettingsDTO, UserRole } from "./types";

/**
 * An api which yields static data.
 */
export class StaticApi implements IApi {
  /**
   * Simulates the settings.
   */
  public async getSettings(): Promise<SettingsDTO> {
    await sleep(100);

    return {
      application: {
        allowProfileFormFrom: new Date(),
        allowProfileFormUntil: new Date(),
        confirmationForm: {
          questions: [],
          title: "Confirmation form",
        },
        hoursToConfirm: 24,
        profileForm: {
          questions: [],
          title: "Profile form",
        },
      },
      email: {
        forgotPasswordEmail: {
          htmlTemplate: "",
          subject: "",
          textTemplate: "",
        },
        sender: "tilt@localhost",
        verifyEmail: {
          htmlTemplate: "",
          subject: "",
          textTemplate: "",
        },
      },
      frontend: {
        colorGradientEnd: "rgb(100, 100, 100)",
        colorGradientStart: "rgb(80, 80, 80)",
        colorLink: "blue",
        colorLinkHover: "cyan",
        loginSignupImage: "http://placehold.it/300x300",
        sidebarImage: "http://placehold.it/300x300",
      },
    };
  }

  /**
   * Simulates a signup api call.
   * @param email The user's email
   * @param _password The user's password
   */
  public async signup(email: string, _password: string): Promise<string> {
    await sleep(100);
    return email;
  }

  /**
   * Simulates an email verification api call.
   * @param token The verify token from the email
   */
  public async verifyEmail(_token: string): Promise<void> {
    await sleep(100);
  }

  /**
   * Simulates a login api call.
   * @param email The user's email
   * @param password The user's password
   */
  public async login(_email: string, _password: string): Promise<UserRole> {
    await sleep(100);
    return UserRole.User;
  }

  /**
   * Simulates a role api call.
   */
  public async getRole(): Promise<UserRole> {
    await sleep(100);
    return UserRole.User;
  }

  /**
   * Simulates a refresh token api call.
   */
  public async refreshLoginToken(): Promise<UserRole> {
    await sleep(100);
    return UserRole.User;
  }

  /**
   * Simulates an update settings api call.
   */
  public async updateSettings(): Promise<SettingsDTO> {
    return await this.getSettings();
  }
}
