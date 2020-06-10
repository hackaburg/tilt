import * as React from "react";
import { useSettingsContext } from "../contexts/settings-context";
import { Form } from "./form";

/**
 * The profile form, d'uuh.
 */
export const ProfileForm = () => {
  const { settings } = useSettingsContext();
  return <Form form={settings.application.profileForm} />;
};
