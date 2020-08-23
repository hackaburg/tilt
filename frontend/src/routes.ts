/**
 * The routes in the frontend.
 */
export enum Routes {
  Admission = "/admission",
  ConfirmationForm = "/confirm",
  Login = "/login",
  Logout = "/logout",
  ProfileForm = "/profile",
  Settings = "/settings",
  SignupDone = "/signup-done",
  Statistics = "/statistics",
  Status = "/status",
  System = "/system",
  VerifyEmail = "/verify",
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
];
