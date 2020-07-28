import * as React from "react";
import { useCallback } from "react";
import type { ApplicationSettingsDTO } from "../api/types/dto";
import { useSettingsContext } from "../contexts/settings-context";
import { FormEditor } from "./form-editor";
import { Col, Row } from "./grid";
import { Subheading } from "./headings";
import { Message } from "./message";
import { TextInput, TextInputType } from "./text-input";

/**
 * Settings to configure the application users have to fill out.
 */
export const ApplicationSettings = () => {
  const { settings, updateSettings, updateError } = useSettingsContext();
  const updateApplicationSettings = useCallback(
    (field: keyof ApplicationSettingsDTO, value: any) => {
      updateSettings({
        ...settings,
        application: {
          ...settings.application,
          [field]: value,
        },
      });
    },
    [updateSettings, settings],
  );

  const handleHoursToConfirmChange = useCallback(
    (value) => updateApplicationSettings("hoursToConfirm", value),
    [updateApplicationSettings],
  );

  const handleAllowProfileFormFromChange = useCallback(
    (value) => updateApplicationSettings("allowProfileFormFrom", value),
    [updateApplicationSettings],
  );

  const handleAllowProfileFormUntilChange = useCallback(
    (value) => updateApplicationSettings("allowProfileFormUntil", value),
    [updateApplicationSettings],
  );

  const handleProfileFormChange = useCallback(
    (value) => updateApplicationSettings("profileForm", value),
    [updateApplicationSettings],
  );

  const handleConfirmationFormChange = useCallback(
    (value) => updateApplicationSettings("confirmationForm", value),
    [updateApplicationSettings],
  );

  return (
    <>
      <Subheading>Application</Subheading>
      {updateError && (
        <Message error>
          <b>Error:</b> {updateError.message}
        </Message>
      )}

      <p>
        An application is divided into two parts: the application and the
        confirmation phase. Once you accept applications, the users will be
        moved to the confirmation queue, where they'll need to fill out the
        remaining questions. If you add questions to the first phase after users
        submitted the first answers, tilt will ask these new questions in the
        confirmation phase.
      </p>
      <Row>
        <Col percent={33}>
          <TextInput
            value={settings.application.hoursToConfirm}
            onChange={handleHoursToConfirmChange}
            type={TextInputType.Number}
            min={1}
            title="Hours to confirm"
            placeholder="keep it fair, e.g. 240 for 10 days"
          />
        </Col>

        <Col percent={33}>
          <TextInput
            value={settings.application.allowProfileFormFrom}
            onChange={handleAllowProfileFormFromChange}
            title="Open registration on"
            placeholder="1970-01-01 00:00:00"
          />
        </Col>

        <Col percent={33}>
          <TextInput
            value={settings.application.allowProfileFormUntil}
            onChange={handleAllowProfileFormUntilChange}
            title="Close registration on"
            placeholder="1970-01-01 00:00:00"
          />
        </Col>
      </Row>

      <p>
        Use the add button to add new questions and the edit button in the top
        right of each question to modify them. You may use Markdown syntax in
        the description, but please keep it short.
      </p>
      <p>
        Questions can have reference names, which you can use to conditionally
        show other questions. For instance, if you have a question, whether
        someone is a student, you could give that question the reference name
        "student" and modify subsequent questions by referencing the user's
        answer to that question.
      </p>

      <FormEditor
        form={settings.application.profileForm}
        onFormChange={handleProfileFormChange}
      />

      <FormEditor
        form={settings.application.confirmationForm}
        onFormChange={handleConfirmationFormChange}
      />
    </>
  );
};
