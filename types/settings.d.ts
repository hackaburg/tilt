export interface ISettings {
  frontend: IFrontendSettings;
}

export interface IFrontendSettings {
  colorGradientStart: string;
  colorGradientEnd: string;
  colorLink: string;
  colorLinkHover: string;
  loginSignupImage: string;
  sidebarImage: string;
}

export interface IEmailSettings {
  templateVerifyEmail: string;
  templateForgotPassword: string;
}
