import { MockedService } from ".";
import { ISettingsService } from "../../../src/services/settings-service";

/**
 * A mocked settings service.
 */
export const MockSettingsService = jest.fn(
  () =>
    new MockedService<ISettingsService>({
      bootstrap: jest.fn(),
      getSettings: jest.fn(),
      updateSettings: jest.fn(),
    }),
);

export const defaultSettings = {
  application: {
    profileForm: {
      title: "Form",
      questions: [],
    },
    confirmationForm: {
      title: "Form",
      questions: [],
    },
    allowProfileFormFrom: new Date(),
    allowProfileFormUntil: new Date(),
    hoursToConfirm: 24,
    allowRatingProjects: false,
  },
  frontend: {
    colorGradientStart: "#53bd9a",
    colorGradientEnd: "#56d175",
    colorLink: "#007bff",
    colorLinkHover: "#0056b3",
    loginSignupImage: "http://placehold.it/300x300",
    sidebarImage: "http://placehold.it/300x300",
  },
  email: {
    sender: "support@hackaburg.de",
    verifyEmail: {
      subject: "",
      htmlTemplate: "",
      textTemplate: "",
    },
    admittedEmail: {
      subject: "",
      htmlTemplate: "",
      textTemplate: "",
    },
    submittedEmail: {
      subject: "",
      htmlTemplate: "",
      textTemplate: "",
    },
    forgotPasswordEmail: {
      subject: "",
      htmlTemplate: "",
      textTemplate: "",
    },
  },
};
