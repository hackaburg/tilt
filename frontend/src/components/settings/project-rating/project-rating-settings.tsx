import * as React from "react";
import { useCallback } from "react";
import type { CriteriaDTO } from "../../../api/types/dto";
import { useSettingsContext } from "../../../contexts/settings-context";
import { Spacer } from "../../base/flex";
import { FlexRowColumnContainer, FlexRowContainer } from "../../base/flex";
import { Text } from "../../base/text";
import { TextInputType } from "../../base/text-input";
import { SettingsSection } from "../settings-section";
import { Subsubheading } from "../../base/headings";
import { FlexRowContainer, FlexColumnContainer } from "../../base/flex";
import { TextField, Switch, FormControlLabel, Stack, Button } from "@mui/material";
import { api, useApi } from "../../../hooks/use-api";


/**
 * Edit or delete a single criteria
 **/
const CriteriaEditor = ({ criteria }) => {
  const { id, title, description } = criteria;

  const handleCriteriaChange = async (key, event): Promise<void> => {
    await api.updateCriteria(
      id,
      { title, description, [key]: event.target.value }
    );
  };

  return (
    <Stack direction="row" spacing={2}>
      <TextField
        value={title}
        onChange={(event) => handleCriteriaChange("title", event)}
        placeholder="title"
        rows={1}
      />
      <TextField
        value={description}
        onChange={(event) => handleCriteriaChange("description", event)}
        placeholder="Description"
        rows={1}
        sx={{ flex: 1 }}
      />
      <Button variant="contained">Delete</Button>
    </Stack>
  )
}

/**
 * A component to edit criteria for rating projects.
 */
export const ProjectRatingSettings = () => {
  // Load all criteria and render them
  const [allCriteria, setAllCriteria] = React.useState([]);
  api.getAllCriteria().then(async (): Promise<void> => {
    setAllCriteria(await api.getAllCriteria())
  })

  // Adding a criteria first calls the POST endpoint, then fetches all crtieria from
  // scratch.
  const addCriteria = async (): Promise<void> => {
    await api.createCriteria({ title: "title", description: "description" })
      .then(async (): Promise<void> => {
        setAllCriteria(await api.getAllCriteria())
      })
  }

  // TODO save button instead of spamming the api on every character change

  // TODO deleting criteria

  return (
    <SettingsSection title="Project Rating">
      <div>
        (These settings are automatically saved)
      </div>
      <div>
        <FormControlLabel control={<Switch />} label="Allow users to rate projects" />
      </div>
      <div>
        <Subsubheading text="Edit Criteria" />
        {allCriteria.map(criteria => [
          <CriteriaEditor criteria={criteria} />,
          <Spacer />
        ])}
      </div>
      <div>
        <Button fullWidth={false} variant="contained" onClick={addCriteria}>
          Add
        </Button>
      </div>
    </SettingsSection>
  );
};
