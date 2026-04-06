import styled from "@emotion/styled";
import * as React from "react";
import { NonGrowingFlexContainer, FlexRowContainer, Spacer } from "../base/flex";
import { Heading, Subheading } from "../base/headings";
import { Page } from "./page";
import { Button } from "../base/button";
import { RoundedImage } from "../base/image";
import { Divider } from "../base/divider";
import { useApi } from "../../hooks/use-api";
import { useLoginContext } from "../../contexts/login-context";
import { TeamDTO } from "../../api/types/dto";
import { PageHeader } from "../base/page-header";

const HeaderContainer = styled(NonGrowingFlexContainer)`
  justify-content: space-between;
  flex-direction: row;
`;

/**
 * A settings dashboard to configure all parts of tilt.
 */
export const ReadOnlyProject = ({ project }) => {
  const loginState = useLoginContext();
  const { user } = loginState;
  const params = new URLSearchParams(document.location.search);

  const [id, setId] = React.useState(0);
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [image, setImage] = React.useState("");
  const [allowRating, setAllowRating] = React.useState(false);

  const {
    value: didUpdateProject,
    isFetching: updateProjectInProgress,
    error: updateProjectError,
    forcePerformRequest: sendSaveProjectRequest,
  } = useApi(
    async (apiClient, wasTriggeredManually) => {
      if (wasTriggeredManually) {
        await apiClient.updateProject(
          id,
          {
            title,
            description,
            image,
            allowRating,
          }
        );
        return true;
      }
      return false;
    },
    [id, title, description, image, allowRating],
  );

  const { value: allUsers } = useApi(
    async (apiClient) => apiClient.getAllUsers(),
    [],
  );

  const handleSubmit = React.useCallback((event: React.SyntheticEvent) => {
    event.preventDefault();
  }, []);

  const updateProjectDone =
    Boolean(didUpdateProject) && !updateProjectInProgress && !updateProjectError;

  React.useEffect(() => {
    if (project) {
      setId(project.id);
      setTitle(project.title);
      setDescription(project.description);
      setImage(project.image);
      setAllowRating(project.allowRating);
    }
  }, [project]);

  return (
    <Page>
      <PageHeader pageTitle={project?.title}/>
      <div>
        <FlexRowContainer>
        <div>
          {project?.image !== "" ? (
            <RoundedImage src={project?.image} style={{ width: "200px", height: "200px" }} />
          ) : null}
          </div>
          <Spacer />
          <p>{project?.description}</p>
        </FlexRowContainer>
      </div>
    </Page>
  );
};
