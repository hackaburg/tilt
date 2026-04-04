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
const CriterionEditor = React.memo(({ criterion, onChange, onDelete }) => {
  // Use react.memo to avoid rerendering the component every time a character is typed
  return (
    <Stack direction="row" spacing={2}>
      <TextField
        value={criterion.title}
        onChange={(event) => onChange({ ...criterion, title: event.target.value })}
        placeholder="title"
        rows={1}
      />
      <TextField
        value={criterion.description}
        onChange={(event) => onChange({ ...criterion, description: event.target.value })}
        placeholder="Description"
        rows={1}
        sx={{ flex: 1 }}
      />
      <Button variant="contained" onClick={() => onDelete(criterion) }>Delete</Button>
    </Stack>
  )
});

/**
 * A component to edit criteria for rating projects.
 */
export const ProjectRatingSettings = () => {
  // Load all criteria and render them
  const [allCriteria, setAllCriteria] = React.useState([]);

  // Do this only on mount
  React.useEffect(
    () => {
      api.getAllCriteria().then((criteria) => {
        setAllCriteria(criteria)
      })
    },
    []
  );

  const addCriterion = useCallback(async (): Promise<void> => {
    const newCriterion = await api.createCriterion({
      title: "title",
      description: "description"
    });
    setAllCriteria([... allCriteria, newCriterion]);
  });

  const changeCriterion = useCallback((changedCriterion) => {
    setAllCriteria(allCriteria.map((criterion) => {
      return criterion.id === changedCriterion.id ? changedCriterion : criterion;
    }))
  });

  const save = useCallback(async () => {
    for (const criterion of allCriteria) {
      await api.updateCriterion(criterion.id, criterion);
    }
  });

  const deleteCriterion = useCallback(async (deletedCriterion): Promise<void> => {
    await api.deleteCriterion(deletedCriterion.id);
    setAllCriteria(allCriteria.filter((criterion) => {
      return criterion.id !== deletedCriterion.id
    }));
  });

  return (
    <SettingsSection title="Project Rating">
      <div>
        <FormControlLabel control={<Switch />} label="Allow users to rate projects" />
      </div>
      <div>
        <Subsubheading text="Edit Criteria" />
        {allCriteria.map(criterion => [
          <CriterionEditor
            criterion={criterion}
            onChange={changeCriterion}
            onDelete={deleteCriterion}
          />,
          <Spacer />
        ])}
      </div>
      <div>
        <Button fullWidth={false} variant="contained" onClick={addCriterion}>
          Add
          </Button>
          <Spacer />
          <Button fullWidth={false} variant="contained" onClick={save}>
          Save
          </Button>
      </div>
    </SettingsSection>
  );
};
