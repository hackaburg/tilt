export interface ISettings {
  frontend: IFrontendSettings;
  email: IEmailSettings;
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
  verifyEmail: IEmailTemplate;
  forgotPasswordEmail: IEmailTemplate;
}

export interface IEmailTemplate {
  textTemplate: string;
  htmlTemplate: string;
}
