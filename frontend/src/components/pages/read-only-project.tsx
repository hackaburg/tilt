import * as React from "react";
import { FlexRowContainer, Spacer } from "../base/flex";
import { Page } from "./page";
import { RoundedImage } from "../base/image";
import { api } from "../../hooks/use-api";
import { PageHeader } from "../base/page-header";
import { RatingForm } from "./rating-form";
import { CriterionDTO, RatingDTO, ProjectDTO } from "../../api/types/dto";

/**
 * A settings dashboard to configure all parts of tilt.
 */
export const ReadOnlyProject = ({ project }: { project: ProjectDTO }) => {
  const [criteria, setCriteria] = React.useState<CriterionDTO[]>([]);
  const [ratings, setRatings] = React.useState<RatingDTO[]>([]);

  React.useEffect(() => {
    api.getAllCriteria().then((criteria_) => {
      setCriteria([...criteria_]);
    });

    if (project) {
      api.getUsersRatingsForProject(project).then((ratings_) => {
        setRatings([...ratings_]);
      });
    }
  }, [project]);

  return (
    <Page>
      <PageHeader pageTitle={project?.title} />
      <div>
        <FlexRowContainer>
          <div>
            {project?.image !== "" ? (
              <RoundedImage
                src={project?.image}
                style={{ width: "200px", height: "200px" }}
              />
            ) : null}
          </div>
          <Spacer />
          <p>{project?.description}</p>
        </FlexRowContainer>
      </div>
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
    </Page>
  );
};
