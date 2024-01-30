import * as React from "react";
import { useMemo, useState } from "react";
import { useLoginContext } from "../../contexts/login-context";
import { useSettingsContext } from "../../contexts/settings-context";
import { useApi } from "../../hooks/use-api";
import { Button } from "../base/button";
import { Code } from "../base/code";
import { CopyableText } from "../base/copyable-text";
import { Divider } from "../base/divider";
import { FormFieldButton } from "../base/form-field-button";
import { Heading, Subheading } from "../base/headings";
import { Text } from "../base/text";
import { TextInput, TextInputType } from "../base/text-input";
import { Page } from "./page";

/**
 * A page to export all user data and to prune the system data.
 */
export const System = () => {
  const { settings } = useSettingsContext();
  const { value: applications } = useApi(
    async (api) => api.getAllApplications(),
    [],
  );

  const allDataJSON = useMemo(() => {
    return JSON.stringify(
      {
        settings,
        applications,
      },
      null,
      2,
    );
  }, [applications, settings]);

  const { logout } = useLoginContext();
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const { isFetching: isPruning, forcePerformRequest: prune } = useApi(
    async (api, wasForced) => {
      if (!wasForced) {
        return;
      }

      if (
        !confirm(
          "Are you really sure you want to prune all data? This is irreversible!",
        )
      ) {
        return;
      }

      await api.pruneSystem();
      logout();
    },
    [logout],
  );

  return (
    <Page>
      <Heading text="System" />

      <Divider />
      <Subheading text="Data export" />
      <Text>
        To analyze your users' data locally, use the JSON shown below. tilt does
        not support importing such data, so this is a readonly operation.
      </Text>
      <Text>
        User data is represented as an array of answers, which reference
        questions by their id. Internally, all answers are represented as
        strings, so number answers are strings, too, and choice answers are
        comma-separated strings. You can use the corresponding question's
        configuration object to see its type and potential parent questions.
      </Text>
      <Text>
        A question can have a parent question, which determines whether the user
        can see the question. This is done through the{" "}
        <Code>showIfParentHasValue</Code> property and you should take it into
        account when analyzing answers, as users might not see every question
        depending on their answers. For instance you might show student specific
        questions, which professional attendees likely didn't answer, therefore
        expecting all users to answer this question might tilt your results.
        tilt, however, ensures all mandatory questions a user sees are actually
        answered.
      </Text>
      <CopyableText text={allDataJSON} />
      <br></br>
      <Subheading text="Prune data" />
      <Text>
        When the event is over, you might want to delete all user data but keep
        the settings such as your forms for your next event. tilt can delete all
        user data including your own account. To Prune the system, type{" "}
        <b>delete</b> in the following text field to confirm your choice. You
        will be logged out after this.
      </Text>

      <FormFieldButton
        field={
          <TextInput
            type={TextInputType.Text}
            value={deleteConfirmation}
            onChange={setDeleteConfirmation}
            title="Confirm prune"
          />
        }
        button={
          <Button
            primary
            onClick={prune}
            loading={isPruning}
            disable={deleteConfirmation !== "delete"}
          >
            Prune
          </Button>
        }
      />
    </Page>
  );
};
