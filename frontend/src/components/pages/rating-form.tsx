import React, { useState } from "react";
import {
  Stack,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
  Tooltip,
} from "@mui/material";
import { api } from "../../hooks/use-api";
import { useLoginContext } from "../../contexts/login-context";
import { Button } from "../base/button";
import { CriterionDTO, ProjectDTO, RatingDTO } from "../../api/types/dto";
import { useNotificationContext } from "../../contexts/notification-context";

interface IRatingFormProps {
  rating?: RatingDTO;
  criterion: CriterionDTO;
  project: ProjectDTO;
}

/**
 * Component that allows users to submit and edit ratings for projects.
 * Only for one criterion, use multiple of this to cover all of them.
 */
export const RatingForm = ({
  rating,
  criterion,
  project,
}: IRatingFormProps) => {
  const loginState = useLoginContext();
  const { user } = loginState;

  const { showNotification } = useNotificationContext();

  const [ratingValue, setRatingValue] = useState<number>(rating?.rating || 3);
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (rating) {
      setRatingValue(rating.rating);
    }
  }, [rating]);

  const handleSubmit = async () => {
    setIsSubmitting(true);

    await api.createRating({
      criterion,
      rating: ratingValue,
      user: user!,
      project,
    } as unknown as RatingDTO);

    setIsSubmitting(false);

    showNotification(`Submitted ${ratingValue} for "${criterion.title}"`);
  };

  return (
    <div
      style={{
        border: "1px solid grey",
        borderRadius: "5px",
        padding: "10px",
        margin: "1rem auto",
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={{ xs: 1, sm: 4 }}
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent="center"
      >
        <Tooltip title={criterion.description}>
          <Typography
            style={{ flex: 1, textAlign: "right" }}
            sx={{ cursor: "help" }}
          >
            {criterion.title}
          </Typography>
        </Tooltip>
        <FormControl component="fieldset">
          <RadioGroup
            row
            value={ratingValue?.toString()}
            onChange={(e) => setRatingValue(parseInt(e.target.value, 10))}
          >
            {[1, 2, 3, 4, 5].map((value) => (
              <FormControlLabel
                key={value.toString()}
                value={value.toString()}
                control={<Radio disabled={isSubmitting} />}
                label={value.toString()}
              />
            ))}
          </RadioGroup>
        </FormControl>
        <div style={{ flex: 1 }}>
          <Button
            onClick={handleSubmit}
            disable={isSubmitting}
            loading={isSubmitting}
          >
            Submit
          </Button>
        </div>
      </Stack>
    </div>
  );
};
