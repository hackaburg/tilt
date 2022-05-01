import * as React from "react";
import { useSettingsContext } from "../../contexts/settings-context";
import { Button } from "../base/button";

/**
 * A button to save settings
 */
export const SettingsSaveButton = () => {
  const { save } = useSettingsContext();
  return (
    <Button onClick={save} primary={true}>
      Save
    </Button>
  );
};
