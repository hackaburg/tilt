export const enum ActivityEvent {
  Signup = "signup",
  EmailVerified = "email_verified",
}

export interface ISignupActivity {
  event: ActivityEvent.Signup;
}

export interface IEmailVerifiedActivity {
  event: ActivityEvent.EmailVerified;
}

export type IActivity =
  ISignupActivity
  | IEmailVerifiedActivity;
