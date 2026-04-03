import * as React from "react";
import { useCallback } from "react";
import type { CriteriaDTO } from "../../../api/types/dto";
import { useSettingsContext } from "../../../contexts/settings-context";
import { Spacer } from "../../base/flex";
import { FlexRowColumnContainer, FlexRowContainer } from "../../base/flex";
import { Text } from "../../base/text";
import { TextInput, TextInputType } from "../../base/text-input";
import { SettingsSection } from "../settings-section";

/**
 * A component to edit criteria for rating projects.
 * TODO WIP
 */
export const ProjectRatingSettings = () => {
  return (
    <SettingsSection title="Project Rating">
      foooo
    </SettingsSection>
  );
};
