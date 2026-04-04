import * as React from "react";
import { useCallback } from "react";
import type { CriterionDTO } from "../../../api/types/dto";
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
const CriterionEditor = ({ criteria }) => {
  const { id, title, description } = criteria;

  const handleCriterionChange = async (key, event): Promise<void> => {
    await api.updateCriterion(
      id,
      { title, description, [key]: event.target.value }
    );
  };

  const deleteCriterion = async (key, event): Promise<void> => {
    await api.deleteCriterion(id);
  };

  return (
    <Stack direction="row" spacing={2}>
      <TextField
        value={title}
        onChange={(event) => handleCriterionChange("title", event)}
        placeholder="title"
        rows={1}
      />
      <TextField
        value={description}
        onChange={(event) => handleCriterionChange("description", event)}
        placeholder="Description"
        rows={1}
        sx={{ flex: 1 }}
      />
      <Button variant="contained" onClick={deleteCriterion}>Delete</Button>
    </Stack>
  )
}

/**
 * A component to edit criteria for rating projects.
 */
export const ProjectRatingSettings = () => {
  // Load all criteria and render them
  const [allCriterion, setAllCriterion] = React.useState([]);
  api.getAllCriteria().then(async (): Promise<void> => {
    setAllCriterion(await api.getAllCriteria())
  })

  // Adding a criteria first calls the POST endpoint, then fetches all crtieria from
  // scratch.
  const addCriterion = async (): Promise<void> => {
    await api.createCriterion({ title: "title", description: "description" })
      .then(async (): Promise<void> => {
        setAllCriterion(await api.getAllCriteria())
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
        {allCriterion.map(criteria => [
          <CriterionEditor criteria={criteria} />,
          <Spacer />
        ])}
      </div>
      <div>
        <Button fullWidth={false} variant="contained" onClick={addCriterion}>
          Add
          </Button>
          <Spacer />
          <Button fullWidth={false} variant="contained" onClick={addCriterion}>
          Save
          </Button>
      </div>
    </SettingsSection>
  );
};
