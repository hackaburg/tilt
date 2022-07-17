import * as React from "react";
import { useCallback } from "react";
import type { ApplicationSettingsDTO } from "../../api/types/dto";
import { useSettingsContext } from "../../contexts/settings-context";
import { useDerivedState } from "../../hooks/use-derived-state";
import { isValidDate } from "../../util";
import { Collapsible } from "../base/collapsible";
import { Spacer } from "../base/flex";
import { FlexRowColumnContainer, FlexRowContainer } from "../base/flex";
import { Text } from "../base/text";
import { TextInput, TextInputType } from "../base/text-input";
import { FormEditor } from "./form-editor";
import { SettingsSection } from "./settings-section";

/**
 * Settings to configure the application users have to fill out.
 */
export const ApplicationSettings = () => {
  const { settings, updateSettings } = useSettingsContext();
  const updateApplicationSettings = useCallback(
    (changes: Partial<ApplicationSettingsDTO>) => {
      updateSettings({
        ...settings,
        application: {
          ...settings.application,
          ...changes,
        },
      });
    },
    [updateSettings, settings],
  );

  const handleHoursToConfirmChange = useCallback(
    (hoursToConfirm: number) => updateApplicationSettings({ hoursToConfirm }),
    [updateApplicationSettings],
  );

  const [allowProfileFormFrom, setAllowProfileFormFrom] = useDerivedState(
    () => settings.application.allowProfileFormFrom.toISOString(),
    [settings],
  );

  const handleAllowProfileFormFromChange = useCallback(
    (value: string) => {
      setAllowProfileFormFrom(value);
      const date = new Date(value);

      if (!isValidDate(date)) {
        return;
      }

      updateApplicationSettings({
        allowProfileFormFrom: date,
      });
    },
    [updateApplicationSettings],
  );

  const [allowProfileFormUntil, setAllowProfileFormUntil] = useDerivedState(
    () => settings.application.allowProfileFormUntil.toISOString(),
    [settings],
  );

  const handleAllowProfileFormUntilChange = useCallback(
    (value: string) => {
      setAllowProfileFormUntil(value);
      const date = new Date(value);

      if (!isValidDate(date)) {
        return;
      }

      updateApplicationSettings({
        allowProfileFormUntil: date,
      });
    },
    [updateApplicationSettings],
  );

  const handleProfileFormChange = useCallback(
    (profileForm: ApplicationSettingsDTO["profileForm"]) =>
      updateApplicationSettings({ profileForm }),
    [updateApplicationSettings],
  );

  const handleConfirmationFormChange = useCallback(
    (confirmationForm: ApplicationSettingsDTO["confirmationForm"]) =>
      updateApplicationSettings({ confirmationForm }),
    [updateApplicationSettings],
  );

  return (
    <SettingsSection title="Application">
      <Text>
        An application is divided into two parts: the profile form and the
        confirmation phase. Once you accept applications, the users will be
        moved to the confirmation queue, where they'll need to fill out the
        remaining questions. If you add questions to the first phase after users
        submitted the first answers, tilt will ask these new questions in the
        confirmation phase. Depending on whether you need their consent, ensure
        these added questions are mandatory.
      </Text>

      <FlexRowContainer>
        <FlexRowColumnContainer>
          <TextInput
            value={settings.application.hoursToConfirm}
            onChange={handleHoursToConfirmChange}
            type={TextInputType.Number}
            min={1}
            title="Hours to confirm"
            placeholder="keep it fair, e.g. 240 for 10 days"
          />
        </FlexRowColumnContainer>
        <Spacer />
        <FlexRowColumnContainer>
          <TextInput
            value={allowProfileFormFrom}
            onChange={handleAllowProfileFormFromChange}
            title="Open registration on"
            placeholder="1970-01-01 00:00:00"
          />
        </FlexRowColumnContainer>
        <Spacer />
        <FlexRowColumnContainer>
          <TextInput
            value={allowProfileFormUntil}
            onChange={handleAllowProfileFormUntilChange}
            title="Close registration on"
            placeholder="1970-01-01 00:00:00"
          />
        </FlexRowColumnContainer>
      </FlexRowContainer>

      <Text>
        Use the add button to add new questions and the edit button in the top
        right of each question to modify them. You may use Markdown syntax in
        the description, but please keep it short.
      </Text>

      <Text>
        Questions can have parents, which you can use to conditionally show
        other questions. For instance, if you have a question, whether someone
        is a student, you could use it to modify subsequent questions by
        referencing the user's answer to that question. Tilt checks for cycles,
        but consider your users filling out the form, i.e. don't conditionally
        show questions on the top when selecting something at the bottom of the
        form.
      </Text>

      <Spacer />

      <Collapsible title="Profile form">
        <FormEditor
          form={settings.application.profileForm}
          onFormChange={handleProfileFormChange}
        />
      </Collapsible>

      <Collapsible title="Confirmation form">
        <FormEditor
          form={settings.application.confirmationForm}
          onFormChange={handleConfirmationFormChange}
        />
      </Collapsible>
    </SettingsSection>
  );
};
