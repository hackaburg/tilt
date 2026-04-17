import React, { useState } from "react";
import {
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import { api } from "../../hooks/use-api";
import { useLoginContext } from "../../contexts/login-context";
import { Button } from "../base/button";
import { CriterionDTO, ProjectDTO, RatingDTO } from "../../api/types/dto";
import { useNotificationContext } from "../../contexts/notification-context";
import { StackWithBorder } from "../base/stack-with-border";

interface IRatingFormProps {
  rating?: RatingDTO;
  criterion: CriterionDTO;
  project: ProjectDTO;
}

const NOT_RATED = -1;

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

  const [ratingValue, setRatingValue] = useState<number>(
    rating?.rating || NOT_RATED,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (rating) {
      setRatingValue(rating.rating);
    }
  }, [rating]);

  const handleSubmit = async () => {
    if (ratingValue == NOT_RATED) {
      return;
    }

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
    <StackWithBorder text={criterion.title} tooltip={criterion.description}>
      <FormControl component="fieldset">
        <RadioGroup
          row
          value={ratingValue?.toString()}
          onChange={(e) => setRatingValue(parseInt(e.target.value, 10))}
        >
          <FormControlLabel
            key="hidden"
            value={NOT_RATED.toString()}
            control={<Radio disabled={isSubmitting} />}
            label=""
            style={{ display: "none" }}
          />
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
    </StackWithBorder>
  );
};
