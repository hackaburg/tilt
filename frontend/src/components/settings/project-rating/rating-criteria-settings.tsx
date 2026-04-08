import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import type { CriterionDTO, SettingsDTO } from "../../../api/types/dto";
import { Spacer } from "../../base/flex";
import { SettingsSection } from "../settings-section";
import { Subsubheading } from "../../base/headings";
import {
  TextField,
  Switch,
  FormControlLabel,
  Stack,
  Button,
} from "@mui/material";
import { api } from "../../../hooks/use-api";

// TODO Seems more maintainable to me if the save button is fine-grained
//  and not global. Remove the global Save button and add one individually for
//  each SettingsSection component for consistency.

// TODO use our own button style

interface ICriterionEditorProps {
  criterion: CriterionDTO;
  onSave: (criterion: CriterionDTO) => Promise<void>;
  onDelete: (criterion: CriterionDTO) => Promise<void>;
}

/**
 * Edit or delete a single criteria.
 */
const CriterionEditor = React.memo(
  ({ criterion, onSave, onDelete }: ICriterionEditorProps) => {
    // Use react.memo to avoid rerendering the component every time a character is typed
    const [title, setTitle] = useState(criterion.title);
    const [description, setDescription] = useState(criterion.description);

    return (
      <Stack direction={{ sm: "column", md: "row" }} spacing={{ xs: 1, sm: 2 }}>
        <TextField
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="title"
          rows={1}
        />
        <TextField
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Description"
          rows={1}
          sx={{ flex: 1 }}
        />
        <Button
          fullWidth={false}
          variant="contained"
          onClick={() => onSave({ ...criterion, title, description })}
        >
          Save
        </Button>
        <Button variant="contained" onClick={() => onDelete(criterion)}>
          Delete
        </Button>
      </Stack>
    );
  },
);

/**
 * A component to edit criteria for rating projects.
 */
export const ProjectRatingSettings = () => {
  // Load all criteria and render them
  const [allCriteria, setAllCriteria] = useState<CriterionDTO[]>([]);
  const [settings, setSettings] = useState<Partial<SettingsDTO>>({});

  // Do this only on mount
  useEffect(() => {
    api.getAllCriteria().then((criteria) => {
      setAllCriteria([...criteria]);
    });

    api.getSettings().then((settings_) => {
      setSettings(settings_);
    });
  }, []);

  useEffect(() => {
    // Only update if settings are loaded
    if (settings.application) {
      api.updateSettings(settings as SettingsDTO);
    }
  }, [settings]);

  const addCriterion = useCallback(async (): Promise<void> => {
    const newCriterion = await api.createCriterion({
      title: "title",
      description: "description",
    } as unknown as CriterionDTO);
    setAllCriteria((prev) => [...prev, newCriterion]);
  }, []);

  const updateCriterion = useCallback(
    async (changedCriterion: CriterionDTO): Promise<void> => {
      await api.updateCriterion(changedCriterion.id, changedCriterion);
      setAllCriteria((prev) =>
        prev.map((criterion) => {
          return criterion.id === changedCriterion.id
            ? changedCriterion
            : criterion;
        }),
      );
    },
    [],
  );

  const deleteCriterion = useCallback(
    async (deletedCriterion: CriterionDTO): Promise<void> => {
      await api.deleteCriterion(deletedCriterion.id);
      setAllCriteria((prev) =>
        prev.filter((criterion) => {
          return criterion.id !== deletedCriterion.id;
        }),
      );
    },
    [],
  );

  const onSwitchChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.checked;
      setSettings((prev) => {
        const changedSettings = {
          ...prev,
          application: {
            ...prev.application,
            allowRatingProjects: value,
          },
        };
        return changedSettings as Partial<SettingsDTO>;
      });
    },
    [],
  );

  return (
    <SettingsSection title="Project Rating">
      <div>
        <FormControlLabel
          control={
            <Switch
              checked={settings?.application?.allowRatingProjects}
              onChange={onSwitchChange}
            />
          }
          label="Allow users to rate other projects"
        />
      </div>
      <div>
        <Subsubheading text="Edit Criteria" />
        {allCriteria.map((criterion) => (
          <React.Fragment key={criterion.id}>
            <CriterionEditor
              criterion={criterion}
              onSave={updateCriterion}
              onDelete={deleteCriterion}
            />
            <Spacer />
          </React.Fragment>
        ))}
      </div>
      <div>
        <Button fullWidth={false} variant="contained" onClick={addCriterion}>
          Add
        </Button>
        <Spacer />
      </div>
    </SettingsSection>
  );
};
