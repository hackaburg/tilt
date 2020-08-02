import styled from "@emotion/styled";
import * as React from "react";
import { useCallback } from "react";
import FlexView from "react-flexview";
import type { ApplicationSettingsDTO } from "../../api/types/dto";
import { useSettingsContext } from "../../contexts/settings-context";
import { Col, ColSpacer, Row } from "../base/grid";
import { Message } from "../base/message";
import { Text } from "../base/text";
import { TextInput, TextInputType } from "../base/text-input";
import { FormEditor } from "./form-editor";
import { SettingsSection } from "./settings-section";

const FormEditorContainer = styled(FlexView)`
  padding-top: 1rem;
`;

/**
 * Settings to configure the application users have to fill out.
 */
export const ApplicationSettings = () => {
  const { settings, updateSettings, updateError } = useSettingsContext();
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
    (hoursToConfirm) => updateApplicationSettings({ hoursToConfirm }),
    [updateApplicationSettings],
  );

  const handleAllowProfileFormFromChange = useCallback(
    (allowProfileFormFrom) =>
      updateApplicationSettings({ allowProfileFormFrom }),
    [updateApplicationSettings],
  );

  const handleAllowProfileFormUntilChange = useCallback(
    (allowProfileFormUntil) =>
      updateApplicationSettings({ allowProfileFormUntil }),
    [updateApplicationSettings],
  );

  const handleProfileFormChange = useCallback(
    (profileForm) => updateApplicationSettings({ profileForm }),
    [updateApplicationSettings],
  );

  const handleConfirmationFormChange = useCallback(
    (confirmationForm) => updateApplicationSettings({ confirmationForm }),
    [updateApplicationSettings],
  );

  return (
    <SettingsSection title="Application">
      {updateError && (
        <Message error>
          <b>Error:</b> {updateError.message}
        </Message>
      )}

      <Text>
        An application is divided into two parts: the profile form and the
        confirmation phase. Once you accept applications, the users will be
        moved to the confirmation queue, where they'll need to fill out the
        remaining questions. If you add questions to the first phase after users
        submitted the first answers, tilt will ask these new questions in the
        confirmation phase. Depending on whether you need their consent, ensure
        these added questions are mandatory.
      </Text>

      <Row>
        <Col>
          <TextInput
            value={settings.application.hoursToConfirm}
            onChange={handleHoursToConfirmChange}
            type={TextInputType.Number}
            min={1}
            title="Hours to confirm"
            placeholder="keep it fair, e.g. 240 for 10 days"
          />
        </Col>
        <ColSpacer />
        <Col>
          <TextInput
            value={settings.application.allowProfileFormFrom}
            onChange={handleAllowProfileFormFromChange}
            title="Open registration on"
            placeholder="1970-01-01 00:00:00"
          />
        </Col>
        <ColSpacer />
        <Col>
          <TextInput
            value={settings.application.allowProfileFormUntil}
            onChange={handleAllowProfileFormUntilChange}
            title="Close registration on"
            placeholder="1970-01-01 00:00:00"
          />
        </Col>
      </Row>

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

      <FormEditorContainer column>
        <FormEditor
          heading="Profile form"
          form={settings.application.profileForm}
          onFormChange={handleProfileFormChange}
        />
      </FormEditorContainer>

      <FormEditorContainer column>
        <FormEditor
          heading="Confirmation form"
          form={settings.application.confirmationForm}
          onFormChange={handleConfirmationFormChange}
        />
      </FormEditorContainer>
    </SettingsSection>
  );
};
