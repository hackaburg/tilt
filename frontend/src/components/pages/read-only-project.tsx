import * as React from "react";
import { Alert } from "@mui/material";
import { FlexRowContainer, Spacer } from "../base/flex";
import { Page } from "./page";
import { RoundedImage } from "../base/image";
import { api } from "../../hooks/use-api";
import { PageHeader } from "../base/page-header";
import { RatingForm } from "./rating-form";
import {
  CriterionDTO,
  RatingDTO,
  ProjectDTO,
  SettingsDTO,
} from "../../api/types/dto";
import { useLoginContext } from "../../contexts/login-context";
import { UserRole } from "../../api/types/enums";

/**
 * A settings dashboard to configure all parts of tilt.
 */
export const ReadOnlyProject = ({ project }: { project: ProjectDTO }) => {
  const { user } = useLoginContext();

  const [criteria, setCriteria] = React.useState<CriterionDTO[]>([]);
  const [ratings, setRatings] = React.useState<RatingDTO[]>([]);
  const [settings, setSettings] = React.useState<Partial<SettingsDTO>>({});

  React.useEffect(() => {
    api.getAllCriteria().then((criteria_) => {
      setCriteria([...criteria_]);
    });

    if (project) {
      api.getUsersRatingsForProject(project).then((ratings_) => {
        setRatings([...ratings_]);
      });
    }

    api.getSettings().then((settings_) => {
      setSettings(settings_);
    });
  }, [project]);

  const image = project?.image || project?.team.teamImg;
  const userAllowedToRate =
    user?.role === UserRole.Root || (user?.team != null && user?.admitted);
  const ratingEnabled =
    project?.allowRating && settings?.project?.allowRatingProjects;

  return (
    <Page>
      <PageHeader pageTitle={project?.title} />
      <div>
        <FlexRowContainer>
          <div>
            {image !== "" ? (
              <RoundedImage
                src={image}
                style={{ width: "200px", height: "200px" }}
              />
            ) : null}
          </div>
          <Spacer />
          <p>{project?.description}</p>
        </FlexRowContainer>
      </div>
      {!userAllowedToRate && ratingEnabled && (
        <Alert severity="warning" style={{ marginTop: "2rem" }}>
          You need to be admitted and part of a team to rate other projects
        </Alert>
      )}
      {userAllowedToRate && ratingEnabled && (
        <div>
          <h2 style={{ marginTop: "4rem" }}>Rate this Project</h2>
          Hover criteria for more information. Rate a criterion high, if you
          think the project did well in this regard.
          {criteria.map((criterion) => (
            <RatingForm
              rating={ratings.find((r) => r.criterion.id === criterion.id)}
              criterion={criterion}
              project={project}
            />
          ))}
        </div>
      )}
    </Page>
  );
};
