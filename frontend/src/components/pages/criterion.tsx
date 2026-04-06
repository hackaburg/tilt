import React, { useState } from "react";
import {
  Stack,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  Alert,
  Typography,
  Tooltip,
} from "@mui/material";
import { api } from "../../hooks/use-api";
import { useLoginContext } from "../../contexts/login-context";

export const CriterionRating = ({
  criterion,
  project,
}) => {
  const loginState = useLoginContext();
  const { user } = loginState;

  const [rating, setRating] = useState<string>("3");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    console.log({ criterion, user, project })

    await api.createRating({
      criterion: {
        Id: criterion.id
      },
      rating: parseInt(rating),
      user: {
        id: user.id
      },
      project: {
        id: project.id
      },
    });
    onRatingSubmitted?.();

    setIsSubmitting(false);
  };

  return (
    <div
      style={{
        border: "1px solid grey", "border-radius": "5px",
        padding: "10px",
        margin: "1rem auto"
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={{ xs: 1, sm: 4 }}
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent="center"
      >
        <Tooltip title={criterion.description}>
          <Typography variant="h6" sx={{ cursor: "help" }}>
            {criterion.title}
          </Typography>
        </Tooltip>

        <FormControl component="fieldset">
          <RadioGroup
            row
            value={rating}
            onChange={(e) => setRating(e.target.value)}
          >
            {[1, 2, 3, 4, 5].map((value) => (
              <FormControlLabel
                key={value}
                value={value.toString()}
                control={<Radio disabled={isSubmitting} />}
                label={value.toString()}
              />
            ))}
          </RadioGroup>
        </FormControl>

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isSubmitting}
          sx={{ alignSelf: { xs: "stretch", sm: "auto" } }}
        >
          {isSubmitting ? "Submitting..." : "Submit"}
        </Button>
      </Stack>

      {error && <Alert severity="error">{error}</Alert>}
    </div>
  );
};
