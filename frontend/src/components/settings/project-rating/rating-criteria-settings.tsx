import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import type { CriterionDTO, SettingsDTO } from "../../../api/types/dto";
import { Spacer } from "../../base/flex";
import { SettingsSection } from "../settings-section";
import { Subsubheading } from "../../base/headings";
import { Button } from "../../base/button";
import { TextField, Switch, FormControlLabel, Stack } from "@mui/material";
import { api } from "../../../hooks/use-api";
import { useNotificationContext } from "../../../contexts/notification-context";

// TODO Seems more maintainable to me if the save button is fine-grained
//  and not global. Remove the global Save button and add one individually for
//  each SettingsSection component for consistency.

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

    const validateAndSave = (changedCriterion: CriterionDTO) => {
      if (changedCriterion.title.length === 0) {
        return;
      }

      if (changedCriterion.description.length === 0) {
        return;
      }

      onSave(changedCriterion);
    };

    return (
      <Stack direction={{ sm: "column", md: "row" }} spacing={{ xs: 1, sm: 2 }}>
        <TextField
          error={title.length === 0}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Title"
          rows={1}
        />
        <TextField
          error={description.length === 0}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Description"
          rows={1}
          sx={{ flex: 1 }}
        />
        <Button
          onClick={() => validateAndSave({ ...criterion, title, description })}
        >
          Save
        </Button>
        <Button onClick={() => onDelete(criterion)}>Delete</Button>
      </Stack>
    );
  },
);

/**
 * A component to edit criteria for rating projects.
 */
export const ProjectProjectSettings = () => {
  // Load all criteria and render them
  const [allCriteria, setAllCriteria] = useState<CriterionDTO[]>([]);
  const [settings, setSettings] = useState<Partial<SettingsDTO>>({});

  const { showNotification } = useNotificationContext();

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
    if (settings.project) {
      api.updateSettings(settings as SettingsDTO);
    }
  }, [settings]);

  const addCriterion = useCallback(async (): Promise<void> => {
    const newCriterion = await api.createCriterion({
      title: "",
      description: "",
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

      showNotification("Saved criterion");
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
          project: {
            ...prev.project,
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
              checked={Boolean(settings?.project?.allowRatingProjects)}
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
        <Button onClick={addCriterion}>Add</Button>
        <Spacer />
      </div>
    </SettingsSection>
  );
};
