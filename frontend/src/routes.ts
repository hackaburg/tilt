/**
 * The routes in the frontend.
 */
export enum Routes {
  Admission = "/admission",
  ConfirmationForm = "/confirm",
  ConfirmationFormApply = "/apply/confirm",
  Login = "/login",
  Logout = "/logout",
  ProfileForm = "/profile",
  ProfileFormApply = "/apply/profile",
  Settings = "/settings",
  SignupDone = "/signup-done",
  Statistics = "/statistics",
  Status = "/dashboard",
  System = "/system",
  VerifyEmail = "/verify",
  Map = "/map",
  Challenges = "/challenges",
}

/**
 * The default initial route for authenticated users.
 */
export const defaultAuthenticatedRoute = Routes.Status;

/**
 * Routes to exclude when redirecting to the default authenticated route.
 */
export const authenticatedRoutes = [
  Routes.Admission,
  Routes.ConfirmationForm,
  Routes.Logout,
  Routes.ProfileForm,
  Routes.Settings,
  Routes.Statistics,
  Routes.System,
  Routes.Map,
  Routes.Challenges,
];
